<template>
  <form class="ui form" style="overflow: hidden" @submit.stop.prevent="submit">
    <div class="field" id="current-tab-url">
      <input v-model="target" placeholder="http://..." disabled />
    </div>

    <div class="field">
      <textarea v-model="note" rows="2" placeholder="Take notes..."></textarea>
    </div>

    <button class="ui tiny positive right floated button" type="submit">Save</button>
  </form>
</template>

<script>
import { storeAnnotation } from './storage.js';

export default {
  props: ['target'],
  data() {
    return {
      note: ''
    }
  },
  methods: {
    submit() {
      let annotation = {
        "@context": "http://www.w3.org/ns/anno.jsonld",
        "type": "Annotation",
        "created": (new Date()).toISOString(),
        "body": {
          "type": "Choice",
          "items": [
            {
              "type": "TextualBody",
              "value": this.note,
              "language": "en",
              "format": "text/plain",
              "creator": {
                "type": "Person"
              }
            }
          ]
        },
        "target": this.target
      };

      storeAnnotation(annotation)
        .then((resp) => {
          if (resp.ok) {
            this.$emit('stored', annotation);
          }
        })
        .catch(console.error);
    }
  }
}
</script>
