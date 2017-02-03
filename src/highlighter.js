const textPosition = require('dom-anchor-text-position');
const textQuote = require('dom-anchor-text-quote');
const wrapRange = require('wrap-range-text');

const page_notes_class = 'page-notes-highlighter';

chrome.runtime.onMessage.removeListener();

// setup context-menu listener
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if ('annotation' in request) {
      let annotation = request.annotation;
      const anno_id = 'anno-' + btoa(annotation.id);
      if ('source' in annotation.target) {
        let selectors = annotation.target.selector;
        for (let i = 0 ; i < selectors.length ; i++) {
          const selector = selectors[i];
          const {type} = selector;
          switch (type) {
            case "TextPositionSelector":
              // skip existing marks
              let existing_marks = document.querySelectorAll(`[data-annotation-id=${anno_id}]`);
              if (existing_marks.length === 0) {
                const mark = document.createElement('mark');
                mark.dataset['annotationId'] = anno_id;
                mark.classList.add('page-notes');
                const range = textPosition.toRange(document.body, selector);
                wrapRange(mark, range);
              }
              break;
          }
        }
      }
    }
  }
);
