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
    let events = await calendar.getEvents(startTime, endTime);
    return events.length === 0;
  } catch (error) {
    console.error('Error in isTimeSlotAvailable:', error);
    throw error;
  }
}
