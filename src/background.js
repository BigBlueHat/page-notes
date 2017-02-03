const {getHighlights, storeAnnotation} = require('./storage.js');

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
    {file: 'annotate.js'},
    () => {
      // talk to it
      chrome.tabs.sendMessage(
        tab.id,
        {}, // TODO: is there anything we need to tell the content script?
        (response) => {
          console.log("Store the Annotation we got back", response);
          if ('annotation' in response) {
            storeAnnotation(response.annotation, (err, obj) => {
              console.log('stored', obj);
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
    {file: 'highlighter.js'},
    () => {
      // get highlights
      getHighlights(tab.url, (annotation) => {
        chrome.tabs.sendMessage(tab.id, {annotation: annotation});
        // TODO: do we need a callback when the highlighting is done?
      });
    });
}

chrome.contextMenus.create({
  id: 'annotate',
  title: 'Annotate...',
  contexts: ["selection"],
  onclick: injectAnnotate
}, onCreated);

chrome.contextMenus.create({
  id: 'show-annotations',
  title: 'Show Annotations',
  // not including the "selection" context as then we'd get stuck in a sub-menu
  contexts: ["page"],
  onclick: injectHighlighter
}, onCreated);
