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
        <NotesList ref="list" :target="target" @loaded="updateCount" />
      </div>
    </div>
  </main>
</template>

<script>
import NotesList from './NotesList';
import NewNoteForm from './NewNoteForm';

export default {
  data() {
    return {
      target: '',
      notes_count: 0
    };
  },
  beforeCreate() {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (results) => {
        this.target = results[0].url;
      }
    );
  },
  computed: {
    list_link() {
      return chrome.runtime.getURL('list/index.html');
    }
  },
  methods: {
    loadAnnotations() {
      this.$refs.list.loadAnnotations();
    },
    updateCount(v) {
      this.notes_count = v;
    }
  },
  components: {
    NewNoteForm,
    NotesList
  }
};
</script>
