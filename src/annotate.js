// receive action (highlight, comment, copy) request
// send window.selection object to context-menu?
// or build TextQuoteSelector here and send that?

const textPosition = require('dom-anchor-text-position');
const textQuote = require('dom-anchor-text-quote');

function getAnnotation() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const textPositionSelector = textPosition.fromRange(document.body, range);
  Object.assign(textPositionSelector, {type: 'TextPositionSelector'});

  const textQuoteSelector = textQuote.fromRange(document.body, range);
  Object.assign(textQuoteSelector, {type: 'TextQuoteSelector'});

  const annotation = {
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    type: 'Annotation',
    target: {
      type: 'SpecificResource',
      source: window.location.href,
      selector: [
        textPositionSelector,
        textQuoteSelector,
      ]
    }
  };

  console.log('annotation', annotation);

  return annotation;
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Sending the Annotation to the background script:");
    sendResponse({
      annotation: getAnnotation()
    });
  });
