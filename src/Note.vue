<template>
  <div class="content">
    <div class="summary">
      <div class="date">{{annotation.created}}</div>
    </div>
    <div class="extra text" v-if="annotation.body">
      <div v-for="item in annotation.body.items">
        <span v-if="item.language && annotation.body.items.length > 1"
          class="ui label">{{ item.language }}</span>
        {{item.value}}
      </div>
    </div>
    <div class="extra text" v-if="exactSelector">
      <blockquote class="ui segment">
        {{exactSelector.prefix}}
        <mark>{{exactSelector.exact}}</mark>
        {{exactSelector.suffix}}
      </blockquote>
    </div>
    <div class="meta" v-if="source">
      <i class="world icon"></i>
      <a :href="source">{{source}}</a>
    </div>
  </div>
</template>

<script>
export default {
  props: ['annotation'],
  computed: {
    source() {
      if ('target' in this.annotation
        && typeof this.annotation.target === 'object'
        && 'source' in this.annotation.target) {
        return this.annotation.target.source;
      }
      return this.annotation.target;
    },
    exactSelector() {
      if (typeof this.annotation.target === 'object'
          && 'selector' in this.annotation.target) {
        const { selector } = this.annotation.target;
        if (typeof selector === 'object') {
          if (Array.isArray(selector)) {
            const exact = selector.filter((sel) => 'exact' in sel);
            return exact[0];
          }
          if ('exact' in selector) {
            return selector;
          }
        }
      }
      return false;
    }
  }
};
</script>
