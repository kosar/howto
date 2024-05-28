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


async function createCalendarEvent(name, email, startTime, endTime) {
  try {
    let calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
    let calendar = CalendarApp.getCalendarById(calendarId);

    console.log('Checking availability for:', { startTime, endTime });

    if (await isTimeSlotAvailable(calendar, startTime, endTime)) {
      let event = await calendar.createEvent(
        `Booking: ${name}`,
        startTime,
        endTime,
        { description: `Booked by: ${email}` }
      );

      if (event) {
        console.log('Calendar event created successfully');
        console.log('Event ID:', event.getId());
        console.log('Event Title:', event.getTitle());
        console.log('Event Start Time:', event.getStartTime());
        console.log('Event End Time:', event.getEndTime());
        console.log('Event Description:', event.getDescription());

        // Return a simplified object with the necessary event information
        return {
          id: event.getId(),
          title: event.getTitle(),
          startTime: event.getStartTime(),
          endTime: event.getEndTime(),
          description: event.getDescription()
        };
      } else {
        console.error('Failed to create calendar event');
        return null;
      }
    } else {
      console.log(`Unable to create event. Time slot from ${startTime} to ${endTime} is not available.`);
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
  const startTime = new Date(2024, 4, 27, 19, 0, 0); // May 27, 2024, 9:00 AM
  const endTime = new Date(2024, 4, 27, 20, 0, 0); // May 27, 2024, 10:00 AM

  const result = await createCalendarEvent(name, email, startTime, endTime);
  console.log('Test result:', result);

  if (result) {
    console.log('Event ID:', result.id);
    console.log('Event Title:', result.title);
    console.log('Event Start Time:', result.startTime);
    console.log('Event End Time:', result.endTime);
    console.log('Event Description:', result.description);
  } else {
    console.log('Failed to create event');
  }
}
