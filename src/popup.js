import {getAnnotations, storeAnnotation} from './storage.js';

import Mustache from 'mustache';
import Vue from 'vue';
import NotesList from './NotesList';

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

let NotesFeed = new Vue({
  el: '#notes-feed',
  data: {
    target: '',
    annotations: []
  },
  render(h) {
    return h('NotesList', {
      props: {
        annotations: this.annotations
      }
    });
  },
  watch: {
    target() {
      this.loadAnnotations();
    },
    annotations(v) {
      // TODO: untangle this and make it part of the component
      $('#notes-count').text(v.length);
    }
  },
  methods: {
    loadAnnotations() {
      getAnnotations(this.target)
        .then((result) => {
          if ('docs' in result && result.docs.length > 0) {
            this.annotations = result.docs.map((doc) => {
              let temp = doc;
              // TODO: maybe don't later data just to hide it...
              delete temp.target;
              return temp;
            });
          }
        });
    }
  },
  components: {
    NotesList
  }
});

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

    // TODO: improve these if statements...they're horrible...
    let languages = [];
    if ('languages' in formData) {
      languages = formData.languages
        .filter(function(lang) {
          // don't translate into the same language as the text
          return (lang !== formData['value-language']);
        });
    }

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
          storeAnnotation(annotation)
            .then(function() {
              NotesFeed.target = annotation.target;
              NotesFeed.loadAnnotations();
            });
        });
    } else {
      storeAnnotation(annotation)
        .then(function() {
          NotesFeed.target = annotation.target;
          NotesFeed.loadAnnotations();
        });
    }
  }
});


$('#list-link').attr('href', chrome.runtime.getURL('list/index.html'));

let currentTabURL = false;
chrome.tabs
  .query(
    { active: true, currentWindow: true },
    function(results) {
      currentTabURL = results[0].url;
      $('#current-tab-url').attr('title', currentTabURL)
        .find('input').val(currentTabURL);
      // show any annotations we have on popup
      NotesFeed.target = currentTabURL;
    });
$form.find('textarea').focus();
