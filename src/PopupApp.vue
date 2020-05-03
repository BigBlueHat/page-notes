<template>
  <main>
    <div class="ui container">
      <NewNoteForm :target="target" @stored="loadAnnotations" />
    </div>
    <div class="ui horizontal divider">
      <span class="ui blue circular label">
        {{ notes_count }}
      </span>
      Notes <a target="_blank" :href="list_link">View All</a>
    </div>
    <div class="ui container">
      <div class="ui feed" id="notes-feed">
        <NotesList :annotations="annotations" />
      </div>
    </div>
  </main>
</template>

<script>
import { getAnnotations } from './storage.js';
import NotesList from './NotesList';
import NewNoteForm from './NewNoteForm';

export default {
  data() {
    return {
      target: '',
      annotations: []
    }
  },
  beforeCreate() {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (results) => {
        this.target = results[0].url;
      });
  },
  watch: {
    target(v) {
      this.loadAnnotations();
    }
  },
  computed: {
    notes_count() {
      return this.annotations.length;
    },
    list_link() {
      return chrome.runtime.getURL('list/index.html');
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
    NewNoteForm,
    NotesList
  }
}
</script>
