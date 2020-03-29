/* HEAD */

class DomNode {
  constructor(node) {
    this.node = node;
  }

  insertDomNodeAfter(tagName, text, selectors) {
    const node = this.createDomNode(tagName, text, selectors);
    this.node.nextSibling.parentNode.insertBefore(node, this.node.nextSibling);
    return new DomNode(node);
  }

  // Inserts a DOM node before the given element
  insertDomNodeBefore(tagName, text, selectors) {
    const node = this.createDomNode(tagName, text, selectors);
    this.node.parentNode.insertBefore(node, this.node);
    return new DomNode(node);
  }

  // Appends a DOM node to the given parent
  appendDomNode(tagName, text, selectors) {
    const node = this.createDomNode(tagName, text, selectors);
    this.node.appendChild(node);
    return new DomNode(node);
  }

  createDomNode(tagName, text, selectors) {
    const elem = document.createElement(tagName);
    if (selectors) {
      for (let i = 0; i < selectors.length; i++) {
        const selectorType = Object.getOwnPropertyNames(selectors[i])[0];
        const selectorIdentifier = selectors[i][selectorType];
        switch (selectorType) {
          case `id`:    elem.id        = selectorIdentifier; break;
          case `class`: elem.className = selectorIdentifier; break;
          default: throw new Error(`Invalid selector type`);
        }
      }
    }
    if (text && text !== ``) {
      switch (tagName) {
        case `p`: elem.appendChild(document.createTextNode(text)); break;
        default:  elem.innerHTML = text;                           break;
      }
    }
    return elem;
  }
}

/* BODY */

displayUpcomingEvent(CUR_DATE);

function displayUpcomingEvent(today) {
  const nextEventOriginal = getNextEvent(today);
  if (nextEventOriginal) {
    const nextEvent = nextEventOriginal.cloneNode(true);
    removeAllAttributes(nextEvent, true);
    const courseTable = new DomNode(COURSE_TABLE);
    const container = courseTable.insertDomNodeAfter(`div`, null, [{ id: `upcomingContainer` }]);
    const table = container.appendDomNode(`table`, null, [{ id: `tUpcomingEvent` }]);
    const thead = table.appendDomNode(`thead`);
    thead.appendDomNode(`tr`)
      .appendDomNode(`td`)
      .appendDomNode(`h2`, `Next course event`);
    table.node.style.backgroundColor = getBackgroundColor(nextEvent.getElementsByTagName(`a`)[0].innerText);
    const tbody = table.appendDomNode(`tbody`);
    tbody.appendDomNode(`tr`)
      .appendDomNode(`td`)
      .node.appendChild(nextEvent);
  }
}
function getNextEvent(today) {
  let eventInDay = false;
  const todayElem = getDayElem(today);
  if (todayElem) {
    let dayIndex = getChildNodeIndex(todayElem, true);
    while (!eventInDay) {
      if (ALL_DAYS[dayIndex].getElementsByClassName(`event`)[0]) {
        eventInDay = true;
      }
      else {
        dayIndex++;
      }
    }
    const upcomingEvents = ALL_DAYS[dayIndex].getElementsByClassName(`event`);
    const upcomingEventsDate = convertDateToDate(ALL_DAYS[dayIndex].querySelector(`.date`).innerText);
    switch (compareDates(today, upcomingEventsDate)) {
      case -1: return upcomingEvents[0];
      case  0: return upcomingEvents[0];
        // const upcomingEventsEndTimes = [];
        // for (let i = 0; i < upcomingEvents.length; i++) {
        //   const timeText = upcomingEvents[i].querySelector(`.time`).innerText;
        //   const eventEndTimeArr = timeText.substring(14).split(`:`);
        //   upcomingEventsEndTimes.push(
        //     new Date(upcomingEventsDate.getFullYear(),
        //       upcomingEventsDate.getMonth() - 1,
        //       upcomingEventsDate.getDay(),
        //       eventEndTimeArr[0],
        //       eventEndTimeArr[1]),
        //   );
        // }
        // let i = 0;
        // while (upcomingEventsEndTimes[i] < today && i < upcomingEventsEndTimes.length) {
        //   i++;
        // }
        // console.log(upcomingEventsEndTimes);
        // console.log(`i: ${i}. length: ${upcomingEventsEndTimes.length}`);
        // if (i === upcomingEventsEndTimes.length) {
        //   const tomorrow = new Date();
        //   tomorrow.setDate(today.getDate() + 1);
        //   return getNextEvent(tomorrow);
        // }
        // return upcomingEvents[i];
      case  1: return undefined;
      default: throw new Error(`compareDates returned something funky`);
    }
  }
}
function removeAllAttributes(elem, alsoRemoveChildrensAttributes = false) {
  if (alsoRemoveChildrensAttributes === false || elem.childNodes[0] === undefined) {
    removeAllAttributesSingleElem(elem);
  }
  else {
    for (let i = 0; i < elem.childNodes.length; i++) {
      removeAllAttributes(elem.childNodes[i], true);
    }
    removeAllAttributesSingleElem(elem);
  }
}
function removeAllAttributesSingleElem(elem) {
  if (elem.attributes) {
    while (elem.attributes.length > 0) {
      elem.removeAttribute(elem.attributes[0].name);
    }
  }
}
function getBackgroundColor(courseName) {
  const courseTableBody = COURSE_TABLE.getElementsByTagName(`tbody`)[0].rows;
  let match = false;
  let i = 0;
  while (!match && i < courseTableBody.length) {
    const tCourseName = courseTableBody[i].getElementsByTagName(`td`)[1].innerText;
    if (tCourseName === courseName) {
      match = true;
    }
    else {
      i++;
    }
  }
  return courseTableBody[i].getElementsByTagName(`td`)[0].style.backgroundColor;
}
