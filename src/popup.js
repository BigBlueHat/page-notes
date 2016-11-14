const PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-find'));

const Mustache = require('mustache');

const translateApiKey = 'trnsl.1.1.20161110T161225Z.e921f6bf7d2941b2.2c92a0a9be39b02fba4ce72ba91afcdf69d0bb29';
const translateURL = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${translateApiKey}`;
/**
 * Reference: https://tech.yandex.com/translate/doc/dg/reference/translate-docpage/
 *
 * key=<API key>
   & text=<text to translate>
   & lang=<translation direction>
   & [format=<text format>]
   & [options=<translation options>]
   & [callback=<name of the callback function>]
 **/

const db = new PouchDB('page-notes');
window.db = db;

// create the target, log any output...just 'cause
db
  .createIndex({
    index: {
      fields: ['target']
    }
  })
  .then(console.log.bind(console))
  .catch(console.log.bind(console));


// returns a promise or error logs
function getAnnotations(target) {
  return db
    .find({
      selector: {
        target: target
      }
    })
    .catch(console.error.bind(console));
}

function displayAnnotations(target) {
  const annotationTemplate = $('#template-event').text();
  const $feed = $('#notes-feed');
  getAnnotations(target)
    .then((result) => {
      if ('docs' in result && result.docs.length > 0) {
        // remove "no annotations yet" message
        $feed.empty();
        $(result.docs).each(function(i, doc) {
          let bodies = doc.body.items.sort(function(a, b) {
            if (a['language'] < b['language']) return -1;
            if (a['language'] > b['language']) return 1;
          });
          let annotation = {
            created: (new Date(doc.created)).toDateString(),
            bodies: bodies
          };
          annotation.bodies[0].active = true;
          let rendered = Mustache.render(annotationTemplate, annotation);
          $feed.append($(rendered));
        });
        $('.tabular.menu .item').tab();
      }
    });
}

function storeAnnotation(annotation) {
  // construcut unique collation friendly id (for _id & id)
  // TODO: find a better URN to keep this stuff in
  let id = 'urn:page-notes:'
    + encodeURI(annotation.target)
    + '/' + (new Date).toISOString();

  annotation._id = id;
  annotation.id = id;

  console.log(JSON.stringify(annotation));

  db.put(annotation)
    .then(function() {
      console.log.bind(console);
      // TODO: move this out...polutes the focus of the function...
      displayAnnotations(annotation.target);
    });
//  chrome.storage.local.set(....
  //  store AnnotationCollection?
  //  uuid for id?
  //
}

$('.ui.checkbox').checkbox();

var $form = $('#page-note');
$form.on('submit', function(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  var formData = $form.form('get values');
  var annotation = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "type": "Annotation",
    "created": (new Date).toISOString(),
    "body": {
      "type": "Choice",
      "items": [
        {
          "type": "TextualBody",
          "value": formData.value,
          "language": "en",
          "format": "text/plain",
          "creator": {
            "type": "Person"
          }
        }
      ]
    },
    "target": currentTabURL
  };

  // TODO: change arbitrary length text check to something smarter
  if ('value' in formData && formData.value.length > 4) {
    let languages = formData.language
      .filter(function(lang) { return Boolean(lang); });

    if (languages.length > 0) {
      let lamdas = languages.map(function(lang) {
        // this little lamda went to market...and did the translation
        return $.getJSON(`${translateURL}&text=${formData.value}&lang=en-${lang}`)
          .then(function(resp) {
            if ('code' in resp && resp.code === 200) {
              annotation.body.items.push({
                type: "TextualBody",
                value: resp.text[0], // TODO: does it ever return more?
                language: lang,
                format: "text/plain",
                creator: {
                  id: "https://translate.yandex.net/api/v1.5/tr.json/translate",
                  type: "Software",
                  "schema:softwareVersion": "1.5",
                  name: "Yandex Translate API",
                  homepage: "https://tech.yandex.com/translate/"
                }
              });
            }
          });
      });
      $.when
        .apply($, lamdas)
        .done(function() {
          storeAnnotation(annotation);
        });
    }
  } else {
    storeAnnotation(annotation);
  }
});

let currentTabURL = false;
$(function() {
  chrome.tabs
    .query(
      { active: true, currentWindow: true },
      function(results) {
        currentTabURL = results[0].url;
        $('#current-tab-url').attr('title', currentTabURL)
          .find('input').val(currentTabURL);
        // show any annotations we have on popup
        displayAnnotations(currentTabURL);
      });
  $form.find('textarea').focus();
});
