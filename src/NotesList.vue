<template>
  <div class="ui feed">
    <div v-if="annotations.length == 0" class="ui message">
      No page notes yet. You should fix that.
    </div>
    <template v-else v-for="annotation in annotations">
      <div :key="annotation.id" class="event">
        <div class="label"><i class="comment outline icon"></i></div>
        <Note :annotation="annotation" @remove="removeNote" />
      </div>
      <div :key="'divider-' + annotation.id" class="ui horizontal divider"></div>
    </template>
  </div>
</template>

<script>
import { getAnnotations, removeAnnotation } from './storage';
import Note from './Note';

export default {
  props: ['target'],
  data() {
    return {
      annotations: []
    };
  },
  watch: {
    target() {
      this.loadAnnotations();
    },
    annotations(v) {
      this.$emit('loaded', v.length);
    }
  },
  components: {
    Note
  },
  methods: {
    loadAnnotations() {
      getAnnotations(this.target)
        .then((result) => {
          if ('docs' in result && result.docs.length > 0) {
            this.annotations = result.docs.map((doc) => {
              const temp = doc;
              delete temp.target;
              return temp;
            });
          }
        });
    },
    removeNote(annotation) {
      removeAnnotation(annotation._id, annotation._rev)
        .then((resp) => {
          if (resp.ok) {
            this.loadAnnotations();
          }
        });
    }
  }
};
</script>
