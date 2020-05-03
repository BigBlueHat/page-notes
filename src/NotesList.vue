<template>
  <div class="ui feed">
    <template v-for="annotation in annotations">
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
