// receive action (highlight, comment, copy) request
// send window.selection object to context-menu?
// or build TextQuoteSelector here and send that?

import * as textPosition from 'dom-anchor-text-position';
import * as textQuote from 'dom-anchor-text-quote';
import html2canvas from 'html2canvas';

function createAnnotation() {
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
    let annotation = createAnnotation();
    if ('screenshot' in request && request.screenshot) {
      // take the screenshot + highlight annotation
      html2canvas(document.body)
        .then((canvas) => {
          let data_url = canvas.toDataURL('image/png');
          annotation.body = {
            type: 'Image',
            format: 'image/png',
            source: data_url
          };
          sendResponse({annotation});
        })
        .catch(console.error);
    } else {
      // otherwise just make the highlight
      sendResponse({annotation});
    }
    // keep this channel open to await the promised response
    return true;
  });
