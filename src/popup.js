import Vue from 'vue';
import PopupApp from './PopupApp';

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: (h) => h('PopupApp'),
  components: {
    PopupApp
  }
});
