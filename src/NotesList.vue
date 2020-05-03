<template>
  <div class="ui feed">
    <div v-if="annotations.length == 0" class="ui message">
      No page notes yet. You should fix that.
    </div>
    <template v-else v-for="annotation in annotations">
      <div :key="annotation.id" class="event">
        <div class="label"><i class="comment outline icon"></i></div>
        <Note :annotation="annotation" />
      </div>
      <div :key="annotation.id" class="ui horizontal divider"></div>
    </template>
  </div>
</template>

<script>
import Note from './Note';

export default {
  props: ['annotations'],
  components: {
    Note
  }
};
</script>
