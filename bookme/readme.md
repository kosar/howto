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

## Detailed Theory of Operation

The Booking Form Web App is built using Google Apps Script, which allows for communication between client-side JavaScript (running in the browser) and server-side code (running on Google's servers). This communication is facilitated by the `google.script.run` API, which enables asynchronous calls from the client to the server.

### Client-Server Communication

The HTML file (`bookingForm.html`) contains the user interface and client-side JavaScript code. When the user interacts with the form, certain events trigger calls to server-side functions using `google.script.run`. Here's how the communication works:

1. **Retrieving Available Time Slots**:
   - When the user selects a date in the date picker, the `getAvailableSlots` function is called on the client-side.
   - This function makes an asynchronous call to the server-side `getAvailableSlots` function using `google.script.run`.
   - The server-side function retrieves the available time slots for the selected date from the specified calendar.
   - The available slots are returned as a JSON string to the client-side.
   - The client-side code parses the JSON string and displays the available time slots in the dropdown menu.

2. **Creating a Calendar Event**:
   - When the user submits the booking form, an event listener is triggered on the client-side.
   - The form data (name, email, selected date, and time slot) is collected and encoded into a JSON string.
   - An asynchronous call is made to the server-side `createCalendarEvent` function using `google.script.run`, passing the JSON string as a parameter.
   - The server-side function parses the JSON string, checks the time slot availability, and creates a new calendar event if the time slot is available.
   - The server-side function returns a JSON string representing the created event or `null` if the event creation fails.
   - The client-side code handles the response, displaying a success banner or an error message accordingly.

### Object Serialization Challenges

One of the challenges faced during the development of this web app was the serialization and deserialization of objects when passing data between the client and server. Google Apps Script's `google.script.run` API requires data to be passed as JSON strings, which means that objects cannot be directly passed along this interface.

To overcome this limitation, the code employs the following techniques:

1. **Serializing Objects to JSON Strings**:
   - On the client-side, before making a call to a server-side function, the relevant data (e.g., form data) is encoded into a JSON string using `JSON.stringify`.
   - This JSON string is then passed as a parameter to the server-side function using `google.script.run`.

2. **Deserializing JSON Strings to Objects**:
   - On the server-side, the received JSON string is parsed back into an object using `JSON.parse`.
   - The server-side function can then work with the deserialized object as needed.

3. **Returning Data as JSON Strings**:
   - When the server-side function needs to return data to the client-side, it first converts the data into a JSON string using `JSON.stringify`.
   - This JSON string is then returned to the client-side, where it is parsed back into an object using `JSON.parse`.

By following this approach, the code ensures that data can be safely and accurately transferred between the client and server, despite the limitations imposed by the `google.script.run` API.

The serialization and deserialization process, while necessary, added complexity to the codebase and required careful handling of data conversions. However, it allowed for seamless communication between the client-side and server-side components, enabling the creation of a functional and user-friendly booking form web application.

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

## To Do / Unfinished




