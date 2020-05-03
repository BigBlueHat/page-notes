import { getAnnotations } from './storage.js';

import Vue from 'vue';
import NotesList from './NotesList';
import NewNoteForm from './NewNoteForm';

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
      document.querySelector('#notes-count').textContent = v.length;
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

let NoteForm = new Vue({
  el: '#new-note-form',
  data: {
    target: ''
  },
  render(h) {
    return h('NewNoteForm', {
      props: {
        target: this.target
      },
      on: {
        stored: this.handledStored
      }
    });
  },
  components: {
    NewNoteForm
  },
  methods: {
    handledStored(annotation) {
      NotesFeed.target = annotation.target;
      NotesFeed.loadAnnotations();
    }
  }
});


document.querySelector('#list-link').setAttribute('href', chrome.runtime.getURL('list/index.html'));

let currentTabURL = false;
chrome.tabs
  .query(
    { active: true, currentWindow: true },
    function(results) {
      currentTabURL = results[0].url;
      NotesFeed.target = currentTabURL;
      NoteForm.target = currentTabURL;
    });
