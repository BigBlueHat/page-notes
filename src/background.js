const {getAnnotations, storeAnnotation} = require('./storage.js');

function onCreated(n) {
  if (chrome.runtime.lastError) {
    console.error(`Error: ${chrome.runtime.lastError}`);
  } else {
    console.log("Context Menu Item added successfully");
  }
}

function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    // inject content script
    // TODO: check for and/or remove if present?
    chrome.tabs.executeScript(
      tab.id,
      {
        file: 'content-script.js'
      },
      function() {
        // talk to it
        chrome.tabs.sendMessage(
          tab.id,
          {}, // TODO: is there anything we need to tell the content script?
          function(response) {
            console.log("Annotation conveyor sent in from content script:");
            console.log(response);
          });
      });
  }
}

chrome.contextMenus.create({
  id: 'annotate',
  title: 'Annotate...',
  contexts: ["selection"]
}, onCreated);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log(info, tab);
  switch (info.menuItemId) {
    case 'annotate':
      console.log(info.selectionText, info);
      chrome.tabs.query({
          currentWindow: true,
          active: true
        },
        sendMessageToTabs
      );
      break;
  }
});
