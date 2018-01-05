import {getHighlights, storeAnnotation} from './storage.js';

function onCreated(n) {
  if (chrome.runtime.lastError) {
    console.error(`Error: ${chrome.runtime.lastError}`);
  } else {
    console.log("Context Menu Item added successfully");
  }
}

function injectAnnotate(info, tab) {
    // inject content script
    // TODO: check for and/or remove if present?
  chrome.tabs.executeScript(
    tab.id,
    {file: 'dist/annotate.js'},
    function() {
      // talk to it
      chrome.tabs.sendMessage(
        tab.id,
        {}, // TODO: is there anything we need to tell the content script?
        function(response) {
          console.log("Store the Annotation we got back");
          console.log(response);
          if ('annotation' in response) {
            storeAnnotation(response.annotation)
              .then(function() {
                // highlight after "Annotate..."
                injectHighlighter(info, tab);
              });
          }
        });
    });
}

function injectHighlighter(info, tab) {
  // inject content script
  // TODO: check for and/or remove if present?
  chrome.tabs.executeScript(
    tab.id,
    {file: 'dist/highlighter.js'},
    function() {
      // get highlights
      getHighlights(tab.url)
        .then((results) => {
          console.log('results', results);
          if ('docs' in results && results.docs.length > 0) {
            // send them to the content script, so it can do the highlighting
            chrome.tabs.sendMessage(
              tab.id,
              {annotations: results.docs}
              // TODO: do we need a callback when the highlighting is done?
              );
          }
        });
    });
}

chrome.contextMenus.create({
  id: 'annotate',
  title: 'Highlight',
  contexts: ["selection"],
  onclick: injectAnnotate
}, onCreated);

chrome.contextMenus.create({
  id: 'show-annotations',
  title: 'Show Highlights',
  // not including the "selection" context as then we'd get stuck in a sub-menu
  contexts: ["page"],
  onclick: injectHighlighter
}, onCreated);
