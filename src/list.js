const {getAllAnnotations} = require('./storage.js');
const Mustache = require('mustache');

let $all_notes = $('#all-notes');
getAllAnnotations()
  .then(function(rv) {
    $all_notes.text(JSON.stringify(rv, null, '  '));
  });
