const levelgraph = require('levelgraph');
const leveljs = require('level-js');
const levelup = require('levelup');
const levelgraphJSONLD = require('levelgraph-jsonld');

const PouchDB = require('pouchdb-browser');

const pdb = new PouchDB('page-notes');
window.pdb = pdb;

const db = levelgraphJSONLD(
  levelgraph(
    levelup('page-notes-index', {
      db: (location) => new leveljs(location)
    })
  )
);
window.db = db;

const context = {
  "@context": "http://www.w3.org/ns/anno.jsonld"
};

// Promise returns a Web Annotation Container
function getAllAnnotations() {
  return pdb.allDocs({include_docs: true})
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

// Query must return an `id`
function searchStream(query, callback) {
  let stream = db.searchStream(query);
  stream.on('data', (data) => {
    if ('id' in data) {
      db.jsonld.get(data.id,
        context,
        (err, json) => {
          // TODO: pass error through to callback?
          if (err) throw err;
          callback(json);
        }
      )
    }
    // TODO: else throw error?
  });
}

// returns a promise or error logs
function getPageNotes(target, on_each) {
  let query = [
    // search for annotations with a oa:hasSource relationship
    { subject: db.v('id'),
      predicate: 'http://www.w3.org/ns/oa#hasTarget',
      object: target}
  ];
  searchStream(query, on_each);
}

// returns a promise or error logs
function getHighlights(target, on_each) {
  let query = [
    // search for annotations with a oa:hasSource relationship
    { subject: db.v('source_bnode'),
      predicate: 'http://www.w3.org/ns/oa#hasSource',
      object: target},
    { subject: db.v('id'),
      object: db.v('source_bnode')}
  ];
  searchStream(query, on_each);
}

// returns the PouchDB promise
function storeAnnotation(annotation, callback) {
  // construcut unique collation friendly id (for _id & id)
  // TODO: find a better URN to keep this stuff in
  // assume annotation.target is an IRI if .source is missing
  let target_iri = annotation.target.source || annotation.target;
  let id = 'urn:page-notes:'
    + encodeURI(target_iri)
    + ':' + (new Date).toISOString();

  annotation.id = id;

  console.log('stored annotation', JSON.stringify(annotation));

  db.jsonld.put(annotation, callback);
}

function reindexAllAnnotations() {
  getAllAnnotations()
    .then(function(rv) {
      if ('items' in rv) {
        console.log('indexing all the things!', rv.items.length);
        rv.items.forEach(annotation => {
          console.log('indexing', annotation);
          storeAnnotation(annotation, (err, rv) => {
            console.log('stored', err, rv);
          });
        });
      }
    });
}

window.getPageNotes = getPageNotes;
window.getHighlights = getHighlights;
window.reindexAllAnnotations = reindexAllAnnotations;

module.exports.getAllAnnotations = getAllAnnotations;
module.exports.getPageNotes = getPageNotes;
module.exports.getHighlights = getHighlights;
module.exports.storeAnnotation = storeAnnotation;
