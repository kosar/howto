function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('bookingForm.html')
    .setTitle('Booking Form');
}

async function getAvailableSlots(date = new Date()) {
  try {
    let calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
    let calendar = CalendarApp.getCalendarById(calendarId);
    let availableSlots = [];

    // Loop through each hour/time slot you want to check
    for (let startTime = 9, endTime = 17; startTime < endTime; startTime++) {
      let start = new Date(date);
      start.setHours(startTime, 0, 0, 0);
      let end = new Date(date);
      end.setHours(startTime + 1, 0, 0, 0);

      if (await isTimeSlotAvailable(calendar, start, end)) {
        availableSlots.push({ start: start, end: end });
      }
    }

    console.log('Available slots:', availableSlots);
    const slotsString = JSON.stringify(availableSlots);
    console.log('Slots string:', slotsString);
    return slotsString;
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    throw error;
  }
}

async function isTimeSlotAvailable(calendar, startTime, endTime) {
  try {
    console.log('Checking events for:', { startTime, endTime });
    let events = await calendar.getEvents(startTime, endTime);
    console.log('Events found:', events.length);
    return events.length === 0;
  } catch (error) {
    console.error('Error in isTimeSlotAvailable:', error);
    throw error;
  }
}

async function createCalendarEvent(paramsString) {
  try {
    // Parse the parameters from the JSON string
    const params = JSON.parse(paramsString);
    const { name, email, startTime, endTime } = params;

    // Convert the ISO strings back to Date objects
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    let calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
    let calendar = CalendarApp.getCalendarById(calendarId);

    console.log('Checking availability for:', { startTimeDate, endTimeDate });

    if (await isTimeSlotAvailable(calendar, startTimeDate, endTimeDate)) {
      let event = await calendar.createEvent(
        `Booking: ${name}`,
        startTimeDate,
        endTimeDate,
        { description: `Booked by: ${email}` }
      );

      if (event) {
        return JSON.stringify(event);
      } else {
        console.error('Failed to create calendar event');
        return null;
      }
    } else {
      console.log(`Unable to create event. Time slot from ${startTimeDate} to ${endTimeDate} is not available.`);
      return null;
    }
  } catch (error) {
    console.error('Error in createCalendarEvent:', error);
    throw error;
  }
}

// Test function
async function testCreateCalendarEvent() {
  const name = 'Test User';
  const email = 'test@example.com';
  const startTime = new Date(2024, 4, 27, 19, 0, 0); // May 27, 2024, 7:00 PM
  const endTime = new Date(2024, 4, 27, 20, 0, 0); // May 27, 2024, 8:00 PM
  const params = {
    name,
    email,
    startTime,
    endTime
  };
  const paramsString = JSON.stringify(params);

  const result = await createCalendarEvent(paramsString);

  if (result) {
    // Convert the result object to a JSON string
    const resultString = JSON.stringify(result);
    console.log('Test result (JSON string):', resultString);
    return resultString;
  } else {
    console.log('Failed to create event');
    return null;
  }
}
