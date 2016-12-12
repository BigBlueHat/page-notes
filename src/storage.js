const PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('page-notes');

// create the target, log any output...just 'cause
db
  .createIndex({
    index: {
      fields: ['target']
    }
  })
  .then(console.log.bind(console))
  .catch(console.log.bind(console));

// returns a promise or error logs
function getAnnotations(target) {
  return db
    .find({
      selector: {
        target: target
      }
    })
    .catch(console.error.bind(console));
}

// returns the PouchDB promise
function storeAnnotation(annotation) {
  // construcut unique collation friendly id (for _id & id)
  // TODO: find a better URN to keep this stuff in
  let id = 'urn:page-notes:'
    + encodeURI(annotation.target)
    + '/' + (new Date).toISOString();

  annotation._id = id;
  annotation.id = id;

  console.log(JSON.stringify(annotation));

  //  TODO: store AnnotationCollection?
  return db.put(annotation);
}

module.exports.getAnnotations = getAnnotations;
module.exports.storeAnnotation = storeAnnotation;
