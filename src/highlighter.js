import * as textPosition from 'dom-anchor-text-position';
import wrapRange from 'wrap-range-text';

chrome.runtime.onMessage.removeListener();

// setup context-menu listener
chrome.runtime.onMessage.addListener(
  (request) => {
    if ('annotations' in request) {
      request.annotations.forEach((annotation) => {
        const annoId = `anno-${btoa(annotation.id)}`;
        // TODO: probably more efficient to find all marks first, then pull
        // check ID's later
        const existingMarks = document.querySelectorAll(`[data-annotation-id="${annoId}"]`);
        // no existing marks, and the annotation is a highlight
        if (existingMarks.length === 0 && 'source' in annotation.target) {
          const selectors = annotation.target.selector;
          selectors.forEach((selector) => {
            const { type } = selector;
            if (type === 'TextPositionSelector') {
              const mark = document.createElement('mark');
              mark.dataset.annotationId = annoId;
              mark.classList.add('page-notes');
              const range = textPosition.toRange(document.body, selector);
              wrapRange(mark, range);
            }
          });
        }
      });
    }
  }
);
