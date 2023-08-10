function scanTravelEmails() {
  Logger.log("Scanning for travel emails...");

  var searchQueries = [
    "subject:(reservation OR booking OR itinerary) has:attachment newer_than:100d",
    "subject:(flight OR airline) has:attachment newer_than:100d",
    "subject:(hotel OR accommodation) has:attachment newer_than:100d",
    "subject:(trip OR travel) has:attachment newer_than:100d",
    "subject:(confirmation) has:attachment newer_than:100d",
    "subject:(itinerary) has:attachment newer_than:100d",
    // Add more search queries here
  ];

  var summarySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Summary");
  var auxiliarySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Auxiliary");

  // Clear previous data from the summary sheet
  summarySheet.clearContents();

  var confirmationData = {}; // Object to store confirmation data

  for (var q = 0; q < searchQueries.length; q++) {
    Logger.log("Scanning for: " + searchQueries[q])
    var threads = GmailApp.search(searchQueries[q]);
    Logger.log ("Found " + threads.length + " threads!")
    
    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      Logger.log ("Found " + messages.length + " messages!")
      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];
        var messageId = message.getId();
        var senderName = message.getFrom();
        var subject = message.getSubject();
        var body = message.getPlainBody();
        var date = message.getDate();
        var confirmationNumber = getConfirmationNumber(body);
        var messageLink = "https://mail.google.com/mail/u/0/#inbox/" + messageId; // Define message link

        if (confirmationNumber) {
          if (!confirmationData[confirmationNumber]) {
            confirmationData[confirmationNumber] = {
              senderNames: [senderName],
              emailLinks: [messageLink], // Include message link here
              subject: subject,
              date: date
            };
          } else {
            if (confirmationData[confirmationNumber].senderNames.indexOf(senderName) === -1) {
              confirmationData[confirmationNumber].senderNames.push(senderName);
            }
            confirmationData[confirmationNumber].emailLinks.push(messageLink); // Include message link here
          }
        }
      }
    }
  }

  var travelData = [];
  var columnHeaders = ["Date", "Sender Names", "Subject", "Confirmation Number", "Email Links"]; // Include headers

  for (var confirmationNumber in confirmationData) {
    var data = confirmationData[confirmationNumber];
    var rowData = [data.date, data.senderNames.join(", "), data.subject, confirmationNumber];
    
    // Add email links to the row
    var emailLinks = data.emailLinks.join("\n");
    rowData.push(emailLinks);
    
    travelData.push(rowData);
  }

  Logger.log("Scan complete. Found " + travelData.length + " unique travel emails.");

  // Write header row
  summarySheet.getRange(1, 1, 1, columnHeaders.length).setValues([columnHeaders]);

  // Populate sheets
  summarySheet.getRange(2, 1, travelData.length, columnHeaders.length).setValues(travelData);
}


function getConfirmationNumber(text) {
  var regex = /\bConfirmation Number: ([A-Za-z0-9]+)\b/i;
  var match = regex.exec(text);
  return match ? match[1] : null;
}


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Travel Email Scanner')
    .addItem('Scan for Travel Emails', 'scanTravelEmails')
    .addToUi();
}
