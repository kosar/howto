// Define a global variable to store the outlier threshold
var outlierThreshold = null;

function getOutlierThreshold(sheet, percentile) {
  // Check if outlierThreshold has already been calculated
  if (outlierThreshold !== null) {
    return outlierThreshold;
  }

  var dataRange = sheet.getDataRange();
  var numRows = dataRange.getNumRows();
  var numCols = dataRange.getNumColumns();
  var values = dataRange.getValues();

  // Extract amounts for analysis
  var amounts = [];
  for (var i = 1; i < numRows; i++) { // Start from 1 to skip header row
    var amount = values[i][2]; // Assuming amount is in the third column (index 2)
    if (typeof amount === 'number') { // Ensure it's a numeric value
      amounts.push(Math.abs(amount)); // Store absolute value (ignoring negatives)
    }
  }

  // Sort amounts in descending order
  amounts.sort(function(a, b) { return b - a; });

  // Calculate the index based on the percentile
  var index = Math.floor(amounts.length * (percentile / 100));

  // Store the threshold amount in the global variable for caching
  outlierThreshold = amounts[index];

  // Return the threshold amount
  return outlierThreshold;
}

function calculateSpendingRate(sheetName = 'Transactions', ignoreOutliers = false, outlierPercentile = 95) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found.`);
    }

    var data = sheet.getDataRange().getValues();

    // Find the header row index
    var headerRow = findHeaderRow(data);
    if (headerRow === -1) {
      throw new Error('Header row not found. Expected: Date, Description, Amount');
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
          dailySpending[date] = [];
        }
        dailySpending[date].push(Math.abs(amount));
      }
    });

    // Optionally filter out outliers
    if (ignoreOutliers) {
      var outlierThreshold = getOutlierThreshold(sheet, outlierPercentile);
      Object.keys(dailySpending).forEach(date => {
        dailySpending[date] = dailySpending[date].filter(amount => amount < outlierThreshold);
      });
    }

    var spendingRates = [];
    var totalSpending = 0;
    var cumulativeSpending = 0;
    var startDate = new Date(Object.keys(dailySpending)[0]);
    var currentDate = new Date();
    var daysInYear = 365;
    var monthlySpending = {};

    Object.keys(dailySpending).forEach((date, index) => {
      totalSpending += dailySpending[date].reduce((acc, val) => acc + val, 0);
      cumulativeSpending += dailySpending[date].reduce((acc, val) => acc + val, 0);
      var dateObj = new Date(date);
      var monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
      if (!monthlySpending[monthKey]) {
        monthlySpending[monthKey] = 0;
      }
      monthlySpending[monthKey] += dailySpending[date].reduce((acc, val) => acc + val, 0);
      var daysSinceStart = (dateObj - startDate) / (1000 * 60 * 60 * 24) + 1;

      // Calculate the trailing 90-day rate with exponential decay
      var trailingStartDate = new Date(dateObj);
      trailingStartDate.setDate(trailingStartDate.getDate() - 90);
      var trailingSpending = 0;
      var weightSum = 0;
      for (var i = 0; i <= 90; i++) {
        var checkDate = new Date(trailingStartDate);
        checkDate.setDate(trailingStartDate.getDate() + i);
        if (dailySpending[checkDate.toDateString()]) {
          var weight = Math.exp(-0.1 * (90 - i)); // Exponential decay factor
          trailingSpending += dailySpending[checkDate.toDateString()].reduce((acc, val) => acc + val, 0) * weight;
          weightSum += weight;
        }
      }
      var trailingRate = weightSum ? trailingSpending / weightSum : 0;

      spendingRates.push([dateObj, dailySpending[date].reduce((acc, val) => acc + val, 0), trailingRate, cumulativeSpending]);
    });

    // Prepare monthly spending data for the chart
    var monthlyRates = [];
    Object.keys(monthlySpending).forEach(monthKey => {
      var [year, month] = monthKey.split('-').map(Number);
      var date = new Date(year, month - 1);
      monthlyRates.push([date, monthlySpending[monthKey]]);
    });

    // Create or update the spending rates sheet
    var outlierInfo = ignoreOutliers ? `- OutlierFilterOn - ${outlierPercentile} - ${outlierThreshold}` : '';
    var ratesSheetName = `${sheetName} - Spending Rates ${outlierInfo}`;
    var ratesSheet = ss.getSheetByName(ratesSheetName);

    if (ratesSheet) {
      ratesSheet.clear();
    } else {
      ratesSheet = ss.insertSheet(ratesSheetName);
    }

    ratesSheet.getRange(1, 1, 1, 4).setValues([["Date", "Total Spending", "Trailing 90-Day Rate", "Cumulative Spending"]]);
    ratesSheet.getRange(2, 1, spendingRates.length, 4).setValues(spendingRates);

    ratesSheet.getRange(1, 6, 1, 2).setValues([["Month", "Monthly Spending"]]);
    ratesSheet.getRange(2, 6, monthlyRates.length, 2).setValues(monthlyRates);

    // Create or update the charts
    var charts = ratesSheet.getCharts();
    charts.forEach(chart => ratesSheet.removeChart(chart));

    // Calculate the position offsets
    var numRows = spendingRates.length + 1; // Including header row
    var numCols = 4; // Number of columns with data

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

    var monthlySpendingChart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(ratesSheet.getRange(1, 6, monthlyRates.length + 1, 1))
      .addRange(ratesSheet.getRange(1, 7, monthlyRates.length + 1, 1))
      .setPosition(40, numCols + 1, 0, 0) // Move to the right of the data
      .setOption('title', `Monthly Spending Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Monthly Spending' }
      })
      .setOption('width', 1000) // Adjust width as needed
      .build();

    ratesSheet.insertChart(monthlySpendingChart);

    var cumulativeSpendingChart = ratesSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(ratesSheet.getRange(1, 1, numRows, 1))
      .addRange(ratesSheet.getRange(1, 4, numRows, 1))
      .setPosition(60, numCols + 1, 0, 0) // Move to the right of the data
      .setOption('title', `Cumulative Spending Over Time - ${sheetName}`)
      .setOption('legend.position', 'bottom')
      .setOption('series', {
        0: { labelInLegend: 'Cumulative Spending' }
      })
      .setOption('width', 1000) // Adjust width as needed
      .build();

    ratesSheet.insertChart(cumulativeSpendingChart);

    SpreadsheetApp.getUi().alert('Spending rate calculation complete!');
  } catch (error) {
    showError(error.message);
  }
}

function findHeaderRow(data) {
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[0] === 'Date' && row[1] === 'Description' && row[2] === 'Amount') {
      return i;
    }
  }
  return -1;
}

function showError(message) {
  var htmlOutput = HtmlService.createHtmlOutput(`<div style="color: red; font-size: 16px;">Error: ${message}</div>`)
    .setWidth(300)
    .setHeight(50);
  SpreadsheetApp.getUi().showModelessDialog(htmlOutput, 'Error');
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Spending Analysis')
    .addItem('Calculate Spending Rate', 'showSheetSelector')
    .addToUi();
}

function showSheetSelector() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sheetNames = sheets.map(sheet => sheet.getName());

  // Prompt for sheet name
  var response = ui.prompt('Select Sheet', 'Enter the name of the sheet containing transactions (or hit Enter for "Sheet1"):', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.OK) {
    var sheetName = response.getResponseText();
    if (sheetName === '') {
      sheetName = 'Sheet1';
    }
    
    if (sheetNames.includes(sheetName)) {
      // Prompt for ignoring outliers
      var responseIgnoreOutliers = ui.alert('Ignore Outliers?', ui.ButtonSet.YES_NO);
      var ignoreOutliers = responseIgnoreOutliers == ui.Button.YES;
      var outlierPercentile = 95; // Default value
      
      if (ignoreOutliers) {
        var responsePercentile = ui.prompt('Enter Percentile for Outliers (0-100)', 'Enter the percentile (e.g., 95)', ui.ButtonSet.OK_CANCEL);
        if (responsePercentile.getSelectedButton() == ui.Button.OK) {
          outlierPercentile = Number(responsePercentile.getResponseText());
          if (isNaN(outlierPercentile) || outlierPercentile < 0 || outlierPercentile > 100) {
            ui.alert('Invalid percentile entered. Using default (95%).');
            outlierPercentile = 95;
          }
        }
      }
      
      calculateSpendingRate(sheetName, ignoreOutliers, outlierPercentile);
    } else {
      ui.alert(`Sheet "${sheetName}" not found.`);
    }
  }
}
