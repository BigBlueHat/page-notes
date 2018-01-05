import {getAllAnnotations} from './storage.js';

getAllAnnotations()
  .then(function(rv) {
    document.getElementById('debug-output').innerText = JSON.stringify(rv, null, '  ');
  });
