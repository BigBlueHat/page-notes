import { getAnnotations } from './storage.js';

import Vue from 'vue';
import PopupApp from './PopupApp';

window.app = new Vue({
  el: '#app',
  render: h => h('PopupApp'),
  components: {
    PopupApp
  }
});
