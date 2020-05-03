<template>
  <div class="ui feed">
    <div v-if="annotations.length == 0" class="ui message">
      No page notes yet. You should fix that.
    </div>
    <template v-else v-for="annotation in annotations">
      <div class="event" :key="annotation.id">
        <div class="label"><i class="comment outline icon"></i></div>
        <Note :annotation="annotation" />
      </div>
      <div class="ui horizontal divider"></div>
    </template>
  </div>
</template>

<script>
import Note from './Note.vue';

export default {
  props: ['annotations'],
  components: {
    Note
  }
}
</script>
