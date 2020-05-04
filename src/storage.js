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
      fields: ['target', 'target.source', 'created']
    }
  })
  .then(console.info)
  .catch(console.error);

// Promise returns a Web Annotation Container
export function getAllAnnotations() {
  return db.allDocs({ include_docs: true })
    .then((results) => {
      const annotations = {
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
        results.rows.forEach((row) => {
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
        created: { $gte: null },
        target
      },
      sort: [{ created: 'desc' }]
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
  const targetIri = annotation.target.source || annotation.target;
  const isoDate = (new Date()).toISOString();
  const id = `urn:page-notes:${encodeURI(targetIri)}:${isoDate}`;

  const annotationToStore = annotation;
  annotationToStore._id = id;
  annotationToStore.id = id;
  annotationToStore.created = isoDate;

  return db.put(annotationToStore);
}

export function removeAnnotation(id, rev) {
  return db.remove(id, rev);
}
