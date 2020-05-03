// receive action (highlight, comment, copy) request
// send window.selection object to context-menu?
// or build TextQuoteSelector here and send that?

import * as textPosition from 'dom-anchor-text-position';
import * as textQuote from 'dom-anchor-text-quote';

function getAnnotation() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  if (range.collapsed) return {};

  const textPositionSelector = textPosition.fromRange(document.body, range);
  Object.assign(textPositionSelector, { type: 'TextPositionSelector' });

  const textQuoteSelector = textQuote.fromRange(document.body, range);
  Object.assign(textQuoteSelector, { type: 'TextQuoteSelector' });

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

  return annotation;
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse({
    annotation: getAnnotation()
  });
});
