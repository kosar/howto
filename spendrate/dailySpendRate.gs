function calculateSpendingRate(sheetName = 'Transactions') {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found.`);
  }
  
  // Verify column structure
  var headers = sheet.getRange(1, 1, 1, 3).getValues()[0];
  if (headers[0] !== 'Date' || headers[1] !== 'Description' || headers[2] !== 'Amount') {
    throw new Error('Invalid column structure. Expected: Date, Description, Amount');
  }
  
  var data = sheet.getDataRange().getValues();
  
  // Remove header row
  data.shift();
  
  // Sort data by date
  data.sort((a, b) => new Date(a[0]) - new Date(b[0]));
  
  var totalDays = (new Date(data[data.length-1][0]) - new Date(data[0][0])) / (1000 * 60 * 60 * 24);
  var totalSpending = 0;
  var spendingRates = [];
  
  for (var i = 0; i < data.length; i++) {
    var amount = data[i][2];
    if (amount < 0) {
      totalSpending += Math.abs(amount);
    }
    
    var daysSinceStart = (new Date(data[i][0]) - new Date(data[0][0])) / (1000 * 60 * 60 * 24);
    var currentRate = totalSpending / (daysSinceStart + 1); // Add 1 to avoid division by zero
    
    spendingRates.push([data[i][0], currentRate]);
  }
  
  // Create or update the spending rates sheet
  var ratesSheetName = `${sheetName} - Spending Rates`;
  var ratesSheet = ss.getSheetByName(ratesSheetName);
  
  if (ratesSheet) {
    ratesSheet.clear();
  } else {
    ratesSheet = ss.insertSheet(ratesSheetName);
  }
  
  ratesSheet.getRange(1, 1, 1, 2).setValues([["Date", "Spending Rate (per day)"]]);
  ratesSheet.getRange(2, 1, spendingRates.length, 2).setValues(spendingRates);
  
  // Create or update the chart
  var charts = ratesSheet.getCharts();
  if (charts.length > 0) {
    ratesSheet.removeChart(charts[0]);
  }
  
  var chart = ratesSheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(ratesSheet.getRange(1, 1, spendingRates.length + 1, 2))
    .setPosition(5, 5, 0, 0)
    .setOption('title', `Spending Rate Over Time - ${sheetName}`)
    .build();
  
  ratesSheet.insertChart(chart);
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
