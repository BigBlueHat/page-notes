const {getAllAnnotations} = require('./storage.js');

getAllAnnotations()
  .then(function(rv) {
    document.getElementById('debug-output').innerText = JSON.stringify(rv, null, '  ');
  });
