function calculateSpendingRate(sheetName = 'Transactions') {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      showError(`Sheet "${sheetName}" not found.`);
      return;
    }

    // Verify column structure
    var headers = sheet.getRange(1, 1, 1, 3).getValues()[0];
    if (headers[0] !== 'Date' || headers[1] !== 'Description' || headers[2] !== 'Amount') {
      showError('Invalid column structure. Expected: Date, Description, Amount');
      return;
    }

    var data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row

    // Sort data by date
    data.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    var dailySpending = {};
    data.forEach(row => {
      var date = new Date(row[0]).toDateString();
      var amount = row[2];
      if (amount < 0) {
        if (!dailySpending[date]) {
          dailySpending[date] = 0;
        }
        dailySpending[date] += Math.abs(amount);
      }
    });

    var spendingRates = [];
    var totalSpending = 0;
    var startDate = new Date(Object.keys(dailySpending)[0]);

    Object.keys(dailySpending).forEach((date, index) => {
      totalSpending += dailySpending[date];
      var daysSinceStart = (new Date(date) - startDate) / (1000 * 60 * 60 * 24) + 1;
      var currentRate = totalSpending / daysSinceStart;
      spendingRates.push([new Date(date), dailySpending[date], currentRate]);
    });

    // Create or update the spending rates sheet
    var ratesSheetName = `${sheetName} - Spending Rates`;
    var ratesSheet = ss.getSheetByName(ratesSheetName);

    if (ratesSheet) {
      ratesSheet.clear();
    } else {
      ratesSheet = ss.insertSheet(ratesSheetName);
    }

    ratesSheet.getRange(1, 1, 1, 3).setValues([["Date", "Total Spending", "Spending Rate (per day)"]]);
    ratesSheet.getRange(2, 1, spendingRates.length, 3).setValues(spendingRates);

    // Create or update the chart
    var charts = ratesSheet.getCharts();
    if (charts.length > 0) {
      ratesSheet.removeChart(charts[0]);
    }

    var chart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, spendingRates.length + 1, 3))
      .setPosition(5, 5, 0, 0)
      .setOption('title', `Spending Rate Over Time - ${sheetName}`)
      .build();

    ratesSheet.insertChart(chart);
  } catch (error) {
    showError(`Error: ${error.message}`);
  }
}

function showError(message) {
  var ui = SpreadsheetApp.getUi();
  var htmlOutput = HtmlService.createHtmlOutput(`<p>${message}</p>`)
    .setWidth(300)
    .setHeight(100);
  ui.showModelessDialog(htmlOutput, 'Error');
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Spending Analysis')
    .addItem('Calculate Spending Rate', 'showSheetSelector')
    .addToUi();
}

function showSheetSelector() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sheetNames = sheets.map(sheet => sheet.getName());

  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    'Select Sheet',
    'Enter the name of the sheet containing transactions:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() == ui.Button.OK) {
    var sheetName = response.getResponseText();
    if (sheetNames.includes(sheetName)) {
      calculateSpendingRate(sheetName);
      ui.alert('Spending rate calculation complete!');
    } else {
      ui.alert(`Sheet "${sheetName}" not found.`);
    }
  }
}
