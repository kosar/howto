function calculateSpendingRate(sheetName = 'Transactions') {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      showError(`Sheet "${sheetName}" not found.`);
      return;
    }

    var data = sheet.getDataRange().getValues();

    // Find the header row index
    var headerRow = findHeaderRow(data);
    if (headerRow === -1) {
      showError('Header row not found. Expected: Date, Description, Amount');
      return;
    }

    // Process rows starting from immediately after the header row
    var startRow = headerRow + 1;
    var numRows = sheet.getLastRow() - startRow + 1;
    var dataRange = sheet.getRange(startRow, 1, numRows, 3);
    var data = dataRange.getValues();

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
    var cumulativeSpending = 0;
    var startDate = new Date(Object.keys(dailySpending)[0]);
    var currentDate = new Date();
    var daysInYear = 365;

    Object.keys(dailySpending).forEach((date, index) => {
      totalSpending += dailySpending[date];
      cumulativeSpending += dailySpending[date];
      var dateObj = new Date(date);
      var daysSinceStart = (dateObj - startDate) / (1000 * 60 * 60 * 24) + 1;

      // Calculate the trailing 90-day rate
      var trailingStartDate = new Date(dateObj);
      trailingStartDate.setDate(trailingStartDate.getDate() - 90);
      var trailingSpending = 0;
      var trailingDays = 0;
      for (var i = 0; i <= 90; i++) {
        var checkDate = new Date(trailingStartDate);
        checkDate.setDate(trailingStartDate.getDate() + i);
        if (dailySpending[checkDate.toDateString()]) {
          trailingSpending += dailySpending[checkDate.toDateString()];
          trailingDays++;
        }
      }
      var trailingRate = trailingDays ? trailingSpending / trailingDays : 0;

      var annualizedRate = trailingRate * daysInYear;
      spendingRates.push([dateObj, dailySpending[date], trailingRate, annualizedRate, cumulativeSpending]);
    });

    // Create or update the spending rates sheet
    var ratesSheetName = `${sheetName} - Spending Rates`;
    var ratesSheet = ss.getSheetByName(ratesSheetName);

    if (ratesSheet) {
      ratesSheet.clear();
    } else {
      ratesSheet = ss.insertSheet(ratesSheetName);
    }

    ratesSheet.getRange(1, 1, 1, 5).setValues([["Date", "Total Spending", "Trailing 90-Day Rate", "Annualized Rate", "Cumulative Spending"]]);
    ratesSheet.getRange(2, 1, spendingRates.length, 5).setValues(spendingRates);

    // Create or update the charts
    var charts = ratesSheet.getCharts();
    charts.forEach(chart => ratesSheet.removeChart(chart));

    // Calculate the position offsets
    var numRows = spendingRates.length + 1; // Including header row
    var numCols = 5; // Number of columns with data

    var totalSpendingChart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, numRows, 1))
      .addRange(ratesSheet.getRange(1, 2, numRows, 1))
      .setPosition(1, numCols + 1, 0, 0) // Move to the right of the data
      .setOption('title', `Total Spending Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Total Spending' }
      })
      .setOption('width', 1000) // Adjust width as needed
      .build();

    ratesSheet.insertChart(totalSpendingChart);

    var trailingRateChart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, numRows, 1))
      .addRange(ratesSheet.getRange(1, 3, numRows, 1))
      .setPosition(20, numCols + 1, 0, 0) // Move to the right of the data
      .setOption('title', `Trailing 90-Day Rate Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Trailing 90-Day Rate' }
      })
      .setOption('width', 1000) // Adjust width as needed
      .build();

    ratesSheet.insertChart(trailingRateChart);

    var annualizedRateChart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, numRows, 1))
      .addRange(ratesSheet.getRange(1, 4, numRows, 1))
      .setPosition(40, numCols + 1, 0, 0) // Move to the right of the data
      .setOption('title', `Annualized Rate Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Annualized Rate' }
      })
      .setOption('width', 1000) // Adjust width as needed
      .build();

    ratesSheet.insertChart(annualizedRateChart);

    var cumulativeSpendingChart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, numRows, 1))
      .addRange(ratesSheet.getRange(1, 5, numRows, 1))
      .setPosition(60, numCols + 1, 0, 0) // Move to the right of the data
      .setOption('title', `Cumulative Spending Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Cumulative Spending' }
      })
      .setOption('width', 1000) // Adjust width as needed
      .build();

    ratesSheet.insertChart(cumulativeSpendingChart);

    // Show completion message if no errors occurred
    showSuccessMessage();

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

function showSuccessMessage() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Spending rate calculation complete!');
}

function findHeaderRow(data) {
  // Function to find the row index of the header row
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === 'Date' && data[i][1] === 'Description' && data[i][2] === 'Amount') {
      return i;
    }
  }
  return -1; // Header row not found
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
    } else {
      ui.alert(`Sheet "${sheetName}" not found.`);
    }
  }
}
