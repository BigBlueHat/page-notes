import Vue from 'vue';
import { getAllAnnotations } from './storage';
import NotesList from './NotesList';

// eslint-disable-next-line no-new
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
