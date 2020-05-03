import * as textPosition from 'dom-anchor-text-position';
import wrapRange from 'wrap-range-text';

chrome.runtime.onMessage.removeListener();

// setup context-menu listener
chrome.runtime.onMessage.addListener(
  (request) => {
    if ('annotations' in request) {
      request.annotations.forEach((annotation) => {
        const annoId = `anno-${btoa(annotation.id)}`;
        if ('source' in annotation.target) {
          const selectors = annotation.target.selector;
          for (let i = 0; i < selectors.length; i + 1) {
            const selector = selectors[i];
            const { type } = selector;

            const existingMarks = document.querySelectorAll(`[data-annotation-id="${annoId}"]`);
            const mark = document.createElement('mark');
            const range = textPosition.toRange(document.body, selector);
            switch (type) {
              case 'TextPositionSelector':
                // skip existing marks
                if (existingMarks.length === 0) {
                  mark.dataset.annotationId = annoId;
                  mark.classList.add('page-notes');
                  wrapRange(mark, range);
                }
                break;
              default:
                break;
            }
          }
        }
      });
    }
  }
);
