# Booking Form Web App with Google Apps Script

## Description

This is a web application built using Google Apps Script that allows users to book appointments by selecting an available time slot from a calendar. The application consists of an HTML file (`bookingForm.html`) that serves as the user interface, and a Google Apps Script file (`code.gs`) that handles the backend logic.

## Features

- User-friendly booking form with input fields for name, email, date, and available time slots.
- Dynamic display of available time slots based on the selected date.
- Validation of user input and error handling.
- Creation of calendar events upon successful booking.
- Success banner notification after a successful booking.

## Installation

To use this web application, follow these steps:

1. Create a new Google Apps Script project in your Google Drive.
2. Copy the contents of the `code.gs` file and paste it into the Code.gs file in your Google Apps Script project.
3. In the Google Apps Script project, go to `File > Project Properties > Script Properties` and add a new property with the key `CALENDAR_ID` and the value of the calendar ID you want to use for booking appointments.
4. Deploy the project as a web app by going to `Publish > Deploy as web app`. Follow the prompts to configure the deployment settings.
5. Copy the web app URL provided after deployment.
6. Create an HTML file (e.g., `bookingForm.html`) and paste the contents of the `bookingForm.html` file from this repository.
7. Replace the `<script>` tag in the HTML file with the following line, replacing `YOUR_WEB_APP_URL` with the URL you copied in step 5:

```html
<script src="YOUR_WEB_APP_URL"></script>
```

8. Open the `bookingForm.html` file in a web browser to access the booking form.

## Usage

1. Open the `bookingForm.html` file in a web browser.
2. Enter your name and email address in the respective fields.
3. Select a date from the date picker.
4. Choose an available time slot from the dropdown menu.
5. Click the "Book Appointment" button to submit the form.
6. If the booking is successful, a success banner will be displayed, and the form will be reset.

## Theory of Operation

The web application consists of two main components: the HTML file (`bookingForm.html`) and the Google Apps Script file (`code.gs`).

### HTML File (`bookingForm.html`)

The HTML file provides the user interface for the booking form. It includes the following elements:

- Input fields for name, email, and date selection.
- A dropdown menu to display available time slots.
- A submit button to book the appointment.
- A success banner to display a notification upon successful booking.

The HTML file also includes jQuery and jQuery UI libraries for date picker functionality and AJAX requests to the Google Apps Script server.

### Google Apps Script File (`code.gs`)

The Google Apps Script file contains the backend logic for the web application. It includes the following functions:

1. `doGet(e)`: This function is the entry point for the web app. It serves the `bookingForm.html` file when the web app URL is accessed.

2. `getAvailableSlots(dateString)`: This function retrieves the available time slots for a given date from the specified calendar. It loops through each hour between 9 AM and 5 PM and checks if the time slot is available using the `isTimeSlotAvailable` function. The available slots are returned as a JSON string.

3. `isTimeSlotAvailable(calendar, startTime, endTime)`: This function checks if a given time slot is available in the specified calendar. It retrieves the events within the given time range and returns `true` if there are no events, indicating that the time slot is available.

4. `createCalendarEvent(paramsString)`: This function creates a new calendar event based on the provided parameters (name, email, start time, end time, and selected date). It first checks if the selected time slot is available using the `isTimeSlotAvailable` function. If the time slot is available, it creates a new calendar event with the provided details. The function returns a JSON string representing the created event or `null` if the event creation fails.

The HTML file interacts with the Google Apps Script server using AJAX requests. When the user selects a date, the `getAvailableSlots` function is called to retrieve the available time slots for that date. The available slots are then displayed in the dropdown menu.

When the user submits the booking form, the `createCalendarEvent` function is called with the provided form data. If the booking is successful, a success banner is displayed, and the form is reset. If an error occurs during the booking process, an error message is displayed.

## Conclusion

This web application demonstrates the integration of Google Apps Script with an HTML user interface to create a functional booking system. Users can easily book appointments by selecting available time slots from a calendar, and the application handles the creation of calendar events seamlessly. The modular design and separation of concerns between the HTML and Google Apps Script files make it easy to maintain and extend the application as needed.

Citations:
[1] https://code.jquery.com/ui/1.13.0/themes/base/jquery-ui.css
[2] https://code.jquery.com/jquery-3.6.0.min.js
[3] https://code.jquery.com/ui/1.13.0/jquery-ui.min.js
[4] https://stackoverflow.com/questions/33276368/booking-form-with-conditional-form-action-based-on-select-option
[5] https://www.youtube.com/watch?v=DLJKBWgG1PA
[6] https://stackoverflow.com/questions/12081390/view-or-test-readme-files-md-in-a-browser-prior-to-pushing-to-an-online-reposit
[7] https://developers.google.com/apps-script/guides/web
[8] https://script.gs/how-to-debug-a-web-app-deployed-using-google-apps-script/


# Appendix: Hosting the Booking Form on Your Own Domain

To host the booking form on your own domain, you'll need to follow these additional steps:

1. **Set up a web server**: You'll need a web server to host the HTML file (`bookingForm.html`). You can use a hosting service like GitHub Pages, Netlify, or any other hosting provider of your choice.

2. **Upload the HTML file**: Upload the `bookingForm.html` file to your web server. Make sure the file is accessible via a URL.

3. **Update the script source**: In the `bookingForm.html` file, locate the following line:

```html
<script src="YOUR_WEB_APP_URL"></script>
```

Replace `YOUR_WEB_APP_URL` with the URL of your Google Apps Script web app deployment. This URL should be the same as the one you copied during the installation process (step 5 in the Installation section).

4. **Configure CORS**: Since the HTML file is hosted on a different domain than the Google Apps Script web app, you'll need to configure Cross-Origin Resource Sharing (CORS) in your Google Apps Script project. Follow these steps:

   - In the Google Apps Script editor, go to `Resources > Advanced Google services`.
   - Enable the `Google Apps Script Web Application` service.
   - Go back to the Code.gs file and add the following line at the top of the `doGet` function:

     ```javascript
     const corsOptions = {
       headers: {
         'Access-Control-Allow-Origin': '*'
       }
     };
     ```

   - Modify the `doGet` function to return the HTML output with the CORS options:

     ```javascript
     function doGet(e) {
       return HtmlService.createHtmlOutputFromFile('bookingForm.html')
         .setTitle('Booking Form')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
         .addMetaTag('viewport', 'width=device-width, initial-scale=1')
         .setFaviconUrl('https://ssl.gstatic.com/docs/script/images/favicon.ico')
         .setResponseOptions(corsOptions);
     }
     ```

5. **Access the booking form**: You can now access the booking form by navigating to the URL where you hosted the `bookingForm.html` file on your web server.

By following these steps, you'll be able to host the booking form on your own domain and integrate it with the Google Apps Script backend. This setup allows you to have a custom domain for your booking form while still leveraging the functionality provided by Google Apps Script.

Note: Ensure that you have properly configured the CORS settings and the script source URL to avoid any cross-origin issues when accessing the booking form from your domain.