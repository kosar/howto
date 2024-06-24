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
    var currentDate = new Date();
    var daysInYear = 365;

    Object.keys(dailySpending).forEach((date, index) => {
      totalSpending += dailySpending[date];
      var dateObj = new Date(date);
      var daysSinceStart = (dateObj - startDate) / (1000 * 60 * 60 * 24) + 1;

      // Calculate the trailing 30-day rate
      var trailingStartDate = new Date(dateObj);
      trailingStartDate.setDate(trailingStartDate.getDate() - 30);
      var trailingSpending = 0;
      var trailingDays = 0;
      for (var i = 0; i <= 30; i++) {
        var checkDate = new Date(trailingStartDate);
        checkDate.setDate(trailingStartDate.getDate() + i);
        if (dailySpending[checkDate.toDateString()]) {
          trailingSpending += dailySpending[checkDate.toDateString()];
          trailingDays++;
        }
      }
      var trailingRate = trailingDays ? trailingSpending / trailingDays : 0;

      var annualizedRate = trailingRate * daysInYear;
      spendingRates.push([dateObj, dailySpending[date], trailingRate, annualizedRate]);
    });

    // Create or update the spending rates sheet
    var ratesSheetName = `${sheetName} - Spending Rates`;
    var ratesSheet = ss.getSheetByName(ratesSheetName);

    if (ratesSheet) {
      ratesSheet.clear();
    } else {
      ratesSheet = ss.insertSheet(ratesSheetName);
    }

    ratesSheet.getRange(1, 1, 1, 4).setValues([["Date", "Total Spending", "Trailing 30-Day Rate", "Annualized Rate"]]);
    ratesSheet.getRange(2, 1, spendingRates.length, 4).setValues(spendingRates);

    // Create or update the chart
    var charts = ratesSheet.getCharts();
    if (charts.length > 0) {
      ratesSheet.removeChart(charts[0]);
    }

    var chart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, spendingRates.length + 1, 1))
      .addRange(ratesSheet.getRange(1, 2, spendingRates.length + 1, 1))
      .addRange(ratesSheet.getRange(1, 3, spendingRates.length + 1, 1))
      .addRange(ratesSheet.getRange(1, 4, spendingRates.length + 1, 1))
      .setPosition(5, 5, 0, 0)
      .setOption('title', `Spending Rate Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Total Spending' },
        1: { labelInLegend: 'Trailing 30-Day Rate' },
        2: { labelInLegend: 'Annualized Rate' }
      })
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
