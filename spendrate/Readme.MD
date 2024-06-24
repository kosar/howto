# Spending Analyzer - Daily Spend Rate Calculator

This Google Apps Script calculates daily spending rates based on transaction data in a Google Sheet. It includes options to filter outliers and visualize spending trends over time.

## Setup

### Prerequisites

Before you begin, ensure you have the following:

- A Google account
- Access to Google Sheets
- Basic knowledge of JavaScript and Google Apps Script

### Getting Started

1. **Clone the Repository**:

   Clone or download the repository containing the script file `dailySpendRate.gs`.

2. **Create a Google Sheet**:

   Create a new Google Sheet or use an existing one where your transaction data is stored. Ensure the sheet has the following format:

   | Date       | Description    | Amount |
   |------------|----------------|--------|
   | YYYY-MM-DD | Transaction 1  | 100.00 |
   | YYYY-MM-DD | Transaction 2  | -50.00 |

   - Date: Should be in YYYY-MM-DD format.
   - Description: Description of the transaction.
   - Amount: Transaction amount. Negative values represent expenses.

   NOTE: This is the default format of transaction downloads in US banks such as Bank Of America's Download Transactions capability.
   You can safely import those downloads  into a sheet and then run this tool over that list of transactions.

3. **Open Google Apps Script Editor**:

   - In your Google Sheet, go to `Extensions` > `Apps Script`.
   - Delete any existing code in the script editor and paste the contents of `dailySpendRate.gs` from your cloned repository.

4. **Save and Authorize**:

   - Save the script (`File` > `Save`).
   - Authorize the script by clicking on `Review Permissions` and following the prompts. This allows the script to access your Google Sheet data.

5. **Set Up the Menu**:

   - Close the script editor and refresh your Google Sheet.
   - You should now see a new menu item `Spending Analysis` in your Google Sheet menu bar.

## Running the Script

1. **Select the Sheet**:

   - Click on `Spending Analysis` > `Calculate Spending Rate`.
   - Enter the name of the sheet containing your transactions when prompted.

2. **Filter Outliers (Optional)**:

   - You'll be asked if you want to ignore outliers. Choose `Yes` to filter out high transactions based on a specified percentile (e.g., 95th percentile).

3. **View Results**:

   - After the script completes, a new sheet named `[Sheet Name] - Spending Rates - OutlierFilterOn - [Percentile] - [Threshold]` is created.
   - This sheet contains:
     - Date: Transaction date.
     - Total Spending: Total spending for that day.
     - Trailing 90-Day Rate: Average spending rate over the last 90 days.
     - Annualized Rate: Estimated annual spending rate.
     - Cumulative Spending: Cumulative spending over time.
   - Charts illustrating spending trends are also included.

## Additional Notes

- **Error Handling**: If there are errors during execution (e.g., incorrect sheet name, missing headers), an error dialog will display with details.
- **Customization**: You can modify the script to suit specific requirements, such as changing date formats, adding more detailed analysis, or adjusting chart settings.

## Support

For questions or issues, please [open an issue](https://github.com/kosar/howto/issues) in the GitHub repository.

---

