## Travel Email Scanner - Code Dissection

This Google Apps Script is designed to scan a Gmail account for travel-related emails and extract relevant information, such as confirmation numbers, sender names, email links, and dates. The extracted data is then organized and displayed in a Google Sheet.

### How it Works

1. The script defines an array of search queries (`searchQueries`) that target various types of travel-related emails from different airlines and travel providers.

2. The `scanTravelEmails` function is the main entry point of the script. It performs the following steps:
   - Clears the contents of the "Summary" sheet in the active Google Spreadsheet.
   - Initializes an object (`confirmationData`) to store confirmation data.
   - Iterates through each search query in the `searchQueries` array.
   - For each search query, it retrieves the matching email threads from the Gmail account using `GmailApp.search`.
   - Processes each email message within the threads, extracting relevant information such as the confirmation number, sender name, subject, email body, and date.
   - Stores the extracted information in the `confirmationData` object, grouping emails by their confirmation number.

3. After processing all emails, the script organizes the data into an array (`travelData`) and writes it to the "Summary" sheet, along with column headers.

4. The script includes several helper functions to extract confirmation numbers from different airline email formats:
   - `getPricelineConfirmationNumber(body_of_email)`: Extracts the confirmation number from Priceline emails.
   - `get_confirmation_number_delta_receipt(emailBody)`: Extracts the confirmation number from Delta flight receipts.
   - `get_confirmation_number_alaska_receipt(emailBody)`: Extracts the confirmation number from Alaska Airlines confirmation letters.
   - `getConfirmationNumber(text)`: A general function that attempts to extract confirmation numbers from email subjects and bodies using a list of common terms and patterns.
   - `getAmericanAirlinesConfirmationNumber(body)`: Extracts the confirmation number from American Airlines emails.

5. The `onOpen` function creates a custom menu in the Google Sheet UI, allowing users to trigger the `scanTravelEmails` function with a single click.

### Adding New Email Senders and Confirmation Emails

To add support for new email senders or confirmation email formats, follow these steps:

1. **Add a new search query**: In the `searchQueries` array, add a new string that matches the desired email pattern. You can use Gmail search operators and keywords to target specific senders, subjects, or email contents.

2. **Create a new confirmation number extraction function**: If the new email format requires a custom extraction method, create a new function similar to `getPricelineConfirmationNumber`, `get_confirmation_number_delta_receipt`, or `get_confirmation_number_alaska_receipt`. This function should use regular expressions or other text parsing techniques to extract the confirmation number from the email body or subject.

3. **Update the `getConfirmationNumber` function**: In the `getConfirmationNumber` function, add a call to your new extraction function. This ensures that the script will attempt to extract the confirmation number using your custom method if the general extraction fails.

### Confirmation Numbers 

The code includes several functions to extract confirmation numbers from different airline email formats. Here's how they are used:

1. The `scanTravelEmails` function is the main entry point that iterates through the email threads matching the search queries.

2. Inside the loop that processes each email message, the code attempts to extract the confirmation number using different methods:

   a. If the email subject contains 'priceline itinerary', it calls the `getPricelineConfirmationNumber(body)` function to extract the confirmation number from the email body.

   b. If the email subject contains 'Your Flight Receipt' and the sender name includes 'delta', it calls the `get_confirmation_number_delta_receipt(body)` function to extract the confirmation number from the email body.

   c. If the email subject contains 'Confirmation Letter' and the sender name includes 'Alaska', it calls the `get_confirmation_number_alaska_receipt(body)` function to extract the confirmation number from the email body.

   d. If none of the above conditions match, it calls the `getConfirmationNumber(body)` function, which attempts to extract the confirmation number from the email body or subject using a general pattern matching approach.

3. The `getConfirmationNumber(body)` function has been updated to include a specific check for American Airlines confirmation numbers. After attempting to extract the confirmation number using the general pattern matching approach, it calls the `getAmericanAirlinesConfirmationNumber(body)` function.

4. The `getAmericanAirlinesConfirmationNumber(body)` function uses a regular expression to extract the confirmation code from the email body specifically for American Airlines emails.

5. If the `getAmericanAirlinesConfirmationNumber(body)` function finds a confirmation number, it returns that value. Otherwise, the `getConfirmationNumber(body)` function falls back to the general extraction logic.

In summary, the code first attempts to use airline-specific functions to extract confirmation numbers from known email formats (Priceline, Delta, Alaska Airlines). If those fail, it falls back to the general `getConfirmationNumber` function, which includes a specific check for American Airlines confirmation numbers using the `getAmericanAirlinesConfirmationNumber` function. This approach allows the code to handle various email formats while also providing a dedicated extraction method for American Airlines emails.

### Known Design Issues

1. **Hardcoded Search Queries**: The search queries are hardcoded in the script, which can make it difficult to maintain and update as new email formats or senders emerge. A more flexible approach would be to store the search queries in a separate data source (e.g., a Google Sheet or a configuration file) and load them dynamically.

2. **Lack of Error Handling**: The script does not include robust error handling mechanisms. If an error occurs during the execution, the script may fail silently or produce unexpected results.

3. **Inefficient Data Storage**: The script stores all extracted data in memory before writing it to the Google Sheet. For large datasets, this approach may consume significant memory resources and potentially cause performance issues or crashes.

4. **Limited Customization**: The script assumes a specific structure for the Google Sheet and does not provide options for customizing the output format or the sheet names.

5. **Lack of Logging and Monitoring**: The script does not include comprehensive logging or monitoring mechanisms, making it difficult to track its execution and identify potential issues or performance bottlenecks.

6. **Lack of Scalability**: The script is designed to run on a single Google Sheet and Gmail account. If the need arises to process multiple accounts or integrate with other data sources, the script may require significant modifications or a complete redesign.

Despite these known issues, the script provides a functional solution for scanning travel-related emails and extracting relevant information. However, for more robust and scalable solutions, it may be necessary to address these design issues or consider alternative approaches, such as using more advanced frameworks or cloud-based solutions.
