// Timeout has to be applied to make sure theme is loaded
highlightDay(new Date()); // Highlights the current day
function highlightDay(day) {
  const dayElem = getDayElem(day);
  if (dayElem) {
    dayElem.style.backgroundColor = `LightGray`;
    dayElem.style.minHeight = `${getWeekMaxHeight(dayElem)}px`;
  }
}
function getDayElem(day) {
  const dates = document.getElementsByClassName(`date`);
  let done = false;
  let i = 0;
  while (dates[i] !== undefined && !done) {
    const dayDate = convertDateToDate(dates[i].innerText);
    switch (compareDates(dayDate, day)) {
      case -1: i++;                 break; // The date being checked is lower than today's date
      case  1: done = true;         break; // The day being checked is in the future
      case  0: return dates[i].parentNode; // The day being checked is today's date - the event is returned
      default: throw new Error(`compareDates() returned something funky.`);
    }
  }
  return undefined;
}
function convertDateToDate(date) {
  const dayDateArr = date.split(`/`);
  return new Date(dayDateArr[2], dayDateArr[1] - 1, dayDateArr[0]);
}
/* Compares two dates by returning
 *   -1 if date1 comes earlier than date2
 *    0 if the dates are the same
 *    1 if date1 comes later than date2
 */
function compareDates(date1, date2) {
  if (sameDate(date1, date2)) {
    return 0;
  }

  return date1 < date2 ? -1 : 1;
}
// Returns true if dates are the same
function sameDate(date1, date2) {
  return (date1.getDate()     === date2.getDate()
       && date1.getMonth()    === date2.getMonth()
       && date1.getFullYear() === date2.getFullYear()
  );
}

// This function makes sure, that the given day has the same height as other days of the week
function getWeekMaxHeight(dayElem) {
  const dayDate = convertDateToDate(dayElem.querySelector(`.date`).innerText);
  const dayDayOfWeek = (dayDate.getDay() + 6) % 7; // Monday = 0 and sunday = 6
  const allDays = document.getElementsByClassName(`day`);
  const monday = allDays[getChildNodeIndex(dayElem, true) - dayDayOfWeek]; // getChildNodeIndex() is in "helperFunctions.js"
  const mondayIndex = getChildNodeIndex(monday, true);                     // getChildNodeIndex() is in "helperFunctions.js"

  let weekMaxHeight = 0;
  for (let i = mondayIndex; i < mondayIndex + 7; i++) {
    weekMaxHeight = Math.max(allDays[i].clientHeight, weekMaxHeight);
  }
  return weekMaxHeight;
}
