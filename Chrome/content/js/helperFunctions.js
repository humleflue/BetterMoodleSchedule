/* eslint no-unused-vars: 0 */

function getUniqueEventIdentifier(event) {
  const index = getChildNodeIndex(event);
  const date = event.parentNode.childNodes[1].innerText;
  return `${date}: Event NO${index}`;
}

function getChildNodeIndex(child, ofSameClass = false) {
  let i = 0;
  let elem = child.previousSibling;
  while (elem !== null) {
    elem = elem.previousSibling;
    if (!ofSameClass || (elem !== null && elem.className === child.className)) {
      i++;
    }
  }
  return i;
}
