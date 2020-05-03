import { getAllAnnotations } from './storage';

getAllAnnotations()
  .then((rv) => {
    document.getElementById('debug-output').innerText = JSON.stringify(rv, null, '  ');
  });
