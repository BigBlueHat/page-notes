const {getAllAnnotations} = require('./storage.js');
const Mustache = require('mustache');

let $all_notes = $('#all-notes');
let template = $('#template-event').text();
getAllAnnotations()
  .then(function(rv) {
    if ('items' in rv) {
      rv.items.forEach((item) => {
        $all_notes.append(Mustache.render(template, item));
      });
    }
  });
