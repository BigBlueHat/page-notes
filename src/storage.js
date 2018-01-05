import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

const db = new PouchDB('page-notes');
// debug only!
window.db = db;

// create the target, log any output...just 'cause
db
  .createIndex({
    index: {
      fields: ['target']
    }
  })
  .then(console.log.bind(console))
  .catch(console.log.bind(console));

// Promise returns a Web Annotation Container
export function getAllAnnotations() {
  return db.allDocs({include_docs: true})
    .then(function(results) {
      var annotations = {
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        // TODO: ...how do we make this actually universal?
        // ...user is not yet identified
        // ...we can get at Platform Arch/OS info https://developer.chrome.com/extensions/runtime#type-PlatformInfo
        // ...it certainly can't stay like this...can it?
        id: 'urn:page-notes:collections:default',
        type: 'AnnotationCollection',
        items: []
      };

      if ('rows' in results) {
        results.rows.forEach(function(row) {
          if ('doc' in row && row.doc.type === 'Annotation') {
            annotations.items.push(row.doc);
          }
        });
      }
      return annotations;
    });
}


// returns a promise or error logs
// TODO: rename this to getPageNotes
export function getAnnotations(target) {
  return db
    .find({
      selector: {
        target: target
      }
    })
    .catch(console.error.bind(console));
}

// returns a promise or error logs
export function getHighlights(target) {
  return db
    .find({
      selector: {
        'target.source': target
      }
    })
    .catch(console.error.bind(console));
}

// returns the PouchDB promise
export function storeAnnotation(annotation) {
  // construcut unique collation friendly id (for _id & id)
  // TODO: find a better URN to keep this stuff in
  // assume annotation.target is an IRI if .source is missing
  let target_iri = annotation.target.source || annotation.target;
  let iso_date = (new Date).toISOString();
  let id = 'urn:page-notes:'
    + encodeURI(target_iri)
    + ':' + iso_date;

  annotation._id = id;
  annotation.id = id;
  annotation.created = iso_date;

  console.log(JSON.stringify(annotation));

  return db.put(annotation);
}
