<template>
  <div class="content">
    <div class="summary">
      <div class="date">{{annotation.created}}</div>
      <div class="ui basic tiny red right floated icon button"
        @click="ux_confirm_delete ? remove() : ux_confirm_delete = true"
        v-on-clickaway="unconfirm">
        <i class="icon trash alternate outline"></i>
        <i v-if="ux_confirm_delete" class="icon question"></i>
      </div>
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
import { mixin as clickaway } from 'vue-clickaway';

export default {
  mixins: [clickaway],
  props: ['annotation'],
  data() {
    return {
      ux_confirm_delete: false
    };
  },
  watch: {
    ux_confirm_delete(v) {
      console.log('can delete?', v);
    }
  },
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
  },
  methods: {
    remove() {
      if (this.ux_confirm_delete) {
        this.$emit('remove', this.annotation);
      }
    },
    unconfirm() {
      this.ux_confirm_delete = false;
    }
  }
};
</script>
