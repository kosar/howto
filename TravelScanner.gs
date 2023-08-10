// Set the number of days for the search parameter
const SEARCH_DAYS = 100;

function scanTravelEmails() {
  Logger.log("Scanning for travel emails...");

  var searchQueries = [
    "subject:(itinerary) has:attachment newer_than:" + SEARCH_DAYS + "d",
    "subject:(confirmation) has:attachment newer_than:" + SEARCH_DAYS + "d",
    "subject:(your trip confirmation) Record Locator newer_than:" + SEARCH_DAYS + "d",
    "from:alaskaair.com your confirmation receipt newer_than:" + SEARCH_DAYS + "d",
    "Your priceline itinerary newer_than:" + SEARCH_DAYS + "d",
    "from:navan.com is confirmed newer_than:" + SEARCH_DAYS + "d",
    "from:nyac.org Confirmation Number newer_than:" + SEARCH_DAYS + "d",
    "from:united.com Receipt for Confirmation newer_than:" + SEARCH_DAYS + "d",
    "no-reply@navan.com is confirmed newer_than:" + SEARCH_DAYS + "d",
    "from:costcotravel.com costco travel: booking newer_than:" + SEARCH_DAYS + "d",
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
    
    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];
        var messageId = message.getId();
        var senderName = message.getFrom();
        var subject = message.getSubject();
        var body = message.getPlainBody();
        var date = message.getDate();
        var confirmationNumber = getConfirmationNumber(body) || getConfirmationNumber(subject); // Try both body and subject
        Logger.log('confirmationNumber: ' + confirmationNumber)
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
            if (confirmationData[confirmationNumber].emailLinks.length < 5) {
              confirmationData[confirmationNumber].emailLinks.push(messageLink); // Include message link here
            }
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
  var terms = [
    "Confirmation Number",
    "Record Locator",
    "confirmation code",
    "Trip Number",
    "Confirmation",
    "eTicket number",
    "reservation"
    // Add more terms here as needed
  ];

  var termsPattern = terms.map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
  var separators = '(?::\\s*|\\s*:\\s*|\\s*\\r?\\n\\s*)'; // Allow for various separators
  var regex = new RegExp('\\b(' + termsPattern + ')' + separators + '\\s*([A-Za-z0-9]+|(?<=\\b' + termsPattern + separators + '\\s*)[A-Za-z0-9]+)', 'i');

  var matches = text.match(regex);
  if (matches && matches.length >= 3) {
    return matches[2].trim();
  }
  return null;
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Travel Email Scanner')
    .addItem('Scan for Travel Emails', 'scanTravelEmails')
    .addToUi();
}
