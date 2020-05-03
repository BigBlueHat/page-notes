<template>
  <div class="content">
    <div class="summary">
      <div class="date">{{annotation.created}}</div>
    </div>
    <div class="extra text" v-if="annotation.body">
      <div v-for="item in annotation.body.items">
        <span v-if="item.language && annotation.body.items.length > 1" class="ui label">{{ item.language }}</span>
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
    <div class="meta">
      <i class="world icon"></i>
      <a :href="_source">{{_source}}</a>
    </div>
  </div>
</template>

<script>
export default {
  props: ['annotation'],
  computed: {
    _source() {
      if ('target' in this.annotation
        && typeof this.annotation.target === 'object'
        && 'source' in this.annotation.target) {
        return this.annotation.target.source;
      } else {
        return this.annotation.target;
      }
    },
    exactSelector() {
      if (typeof this.annotation.target === 'object'
          && 'selector' in this.annotation.target) {
        let selector = this.annotation.target.selector;
        if (typeof selector === 'object') {
          if (Array.isArray(selector)) {
            let exact = selector.map((sel) => {
              if ('exact' in sel) {
                return sel;
              }
            }).filter((i) => i); // clean out empties
            return exact[0];
          } else if ('exact' in selector) {
            return selector;
          }
        }
      } else {
        return false;
      }
    }
  }
}
</script>
