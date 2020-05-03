import {getAllAnnotations} from './storage.js';
import Vue from 'vue';
import NotesList from './NotesList';

new Vue({
  el: '#all-notes',
  data: {
    annotations: []
  },
  render(h) {
    return h('NotesList', {
      props: {
        annotations: this.annotations
      }
    });
  },
  created() {
    this.loadAnnotations();
  },
  methods: {
    loadAnnotations() {
      getAllAnnotations()
        .then((rv) => {
          if ('items' in rv) {
            this.annotations = rv.items;
          }
        });
    }
  },
  components: {
    NotesList
  }
});
