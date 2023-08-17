## Travel Email Scanner Using Google Apps Script

This guide will walk you through the process of setting up and running a Google Apps Script to scan travel-related emails, extract confirmation data, and populate a Google Sheets spreadsheet.

### Problem Solved: Simplifying Travel Confirmation Tracking

The Travel Email Scanner script provides an automated solution for tracking travel confirmations from various sources. It addresses the challenge of manually searching through emails to find important travel details, such as confirmation numbers and travel dates. By utilizing specific search queries and intelligent data extraction techniques, the script streamlines the process of aggregating and organizing travel-related information into a single, easily accessible Google Sheets spreadsheet. This solution saves time, reduces manual effort, and ensures that essential travel details are always at your fingertips.

### Step 1: Create a New Google Sheets Spreadsheet

1. Open Google Drive (https://drive.google.com).
2. Click the "+ New" button and select "Google Sheets" to create a new spreadsheet.
3. Rename the spreadsheet to a meaningful name, such as "Travel Confirmation Data."

### Step 2: Add Sheets to the Spreadsheet

1. In the newly created spreadsheet, add two sheets:
   - Name the first sheet "Summary."
   - Name the second sheet "Auxiliary."

### Step 3: Copy and Paste the Google Apps Script Code

1. Open the Google Sheets spreadsheet.
2. Click on "Extensions" in the top menu, then select "Apps Script."
3. In the Apps Script editor, you will see a blank project. Replace the existing code with the provided Apps Script code.
4. Replace the `// Add more search queries here` comment with additional search queries if needed.

### Step 4: Save and Run the Script

1. Save the script by clicking the floppy disk icon or pressing `Ctrl + S` (`Command + S` on Mac).
2. Close the Apps Script editor.

### Step 5: Set Up the Google Apps Script Trigger

1. In the Google Sheets spreadsheet, click on the "Extensions" menu, then select "Apps Script."
2. In the Apps Script editor, click on the clock icon on the left sidebar to open the Triggers page.
3. Click on the "+ Add Trigger" button in the bottom right corner.
4. Choose the following trigger configuration:
   - Choose function to run: `scanTravelEmails`
   - Choose deployment: "Head"
   - Select event source: "Time-driven"
   - Select type of time based trigger: "Minutes timer"
   - Select the number of minutes: Set an interval that suits your needs (e.g., every 15 minutes).
5. Click the "Save" button to create the trigger.

### Step 6: Grant Necessary Permissions

1. After creating the trigger, Google Apps Script may prompt you to grant permissions. Follow the prompts to grant the necessary permissions for the script to access your Gmail and Google Sheets data.

### Step 7: Monitor the Script Execution

1. The script will now run automatically at the specified interval.
2. It will scan your Gmail for travel-related emails, extract confirmation data, and populate the "Summary" sheet with the data.
3. You can manually trigger the script by clicking on the "Travel Email Scanner" menu in the Google Sheets toolbar and selecting "Scan for Travel Emails."

### Understanding Search Queries and Regular Expressions

The script uses search queries to identify relevant emails based on keywords in the subject line and attachments. For instance, the search query "subject:(itinerary) has:attachment newer_than:100d" looks for emails with the word "itinerary" in the subject and an attachment received within the last 100 days.

For more complex emails, such as those from Priceline, a specialized regular expression is used to extract confirmation data. This involves pattern matching within the email body. You can create custom regular expressions to match specific data patterns.

### Extending the Script with AI-Powered Functions

As email formats become more complex, generating accurate regular expressions can become challenging. One approach to handle such complexity is to leverage generative AI to create functions that extract desired fields from emails automatically. This way, the script can adapt to new confirmation email formats over time.

#### Using AI to Generate Complex Regular Expressions

In some cases, extracting specific data from complex email formats may require intricate regular expressions. You can leverage AI-powered interfaces, like ChatGPT, to generate JavaScript code that handles these challenges. Here's how to do it:

1. **Provide a Clear Prompt**: In a ChatGPT-like interface, provide a clear and detailed prompt. Describe the email format and the fields you want to extract. For example, you could provide an example Priceline email and specify that you want to extract the confirmation number, check-in date, and check-out date.

2. **Generate JavaScript Code**: After providing the prompt, ChatGPT can generate JavaScript code that contains a regular expression tailored to your requirements. This code will be designed to extract the desired fields from emails with similar formats.

3. **Review and Test**: Review the generated JavaScript code to ensure it accurately captures the data you want. Test the code on sample emails to verify its effectiveness.

4. **Integrate the Code**: Once satisfied with the generated code, you can integrate it into your Apps Script. Create a new function similar to the Priceline example function. Replace the example regular expression and field extraction logic with the generated code.

By following these steps, you can handle complex regular expressions and streamline the process of extending the script's functionality to handle intricate email formats. This approach allows you to adapt the script to evolving email structures without delving deeply into the complexities of regular expression crafting.

# Code

### Understanding the Code Flow and Field Extraction

The script's main function, `scanTravelEmails`, follows a structured flow to scan emails, extract confirmation data, and populate the Google Sheets spreadsheet. It starts by defining search queries to identify relevant emails. These queries are used to fetch threads of emails from Gmail. Within each thread, individual messages are looped through to extract sender names, subjects, bodies, and dates. The `getConfirmationNumber` function utilizes regular expressions to extract confirmation numbers from the subject or body of the email. For more complex cases, such as Priceline emails, the specialized function `getPricelineConfirmationNumber` is used, which employs a distinct regular expression to extract confirmation details such as check-in and check-out dates from the email body. This extracted data is then organized into a data structure and finally sorted by date before being populated in the "Summary" sheet.

### Access the Code

You can find the complete Apps Script code for the Travel Email Scanner in the [`TravelScanner.gs`](TravelScanner.gs) file in this GitHub repository. This code includes the functions for scanning travel-related emails, extracting confirmation data, and populating the Google Sheets spreadsheet. It is all in one file now, but could be modularized in future revisions. This is all a hobby, let's not go overboard with the optimization too early, I say! 

**Note:** This script may require modifications based on specific email formats and the structure of the confirmation data.
