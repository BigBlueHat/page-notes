const translateApiKey = 'trnsl.1.1.20161110T161225Z.e921f6bf7d2941b2.2c92a0a9be39b02fba4ce72ba91afcdf69d0bb29';
const translateURL = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${translateApiKey}`;
/**
 * Reference: https://tech.yandex.com/translate/doc/dg/reference/translate-docpage/
 *
 * key=<API key>
   & text=<text to translate>
   & lang=<translation direction>
   & [format=<text format>]
   & [options=<translation options>]
   & [callback=<name of the callback function>]
 **/

function storeAnnotation(annotation) {
  console.log(JSON.stringify(annotation));
}


$('.ui.checkbox').checkbox();

var $form = $('#page-note');
$form.on('submit', function(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  var formData = $form.form('get values');
  var annotation = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "type": "Annotation",
    "body": {
      "type": "Choice",
      "items": [
        {
          "value": formData.value,
          "language": "en"
        }
      ]
    },
    "target": location.href
  };

  // TODO: change arbitrary length text check to something smarter
  if ('value' in formData && formData.value.length > 4) {
    let languages = formData.language
      .filter(function(lang) { return Boolean(lang); });

    if (languages.length > 0) {
      let lamdas = languages.map(function(lang) {
        // this little lamda went to market...and did the translation
        return $.getJSON(`${translateURL}&text=${formData.value}&lang=en-${lang}`)
          .then(function(resp) {
            if ('code' in resp && resp.code === 200) {
              annotation.body.items.push({
                type: "TextualBody",
                value: resp.text[0], // TODO: does it ever return more?
                language: lang,
                format: "text/plain",
                creator: {
                  id: "https://translate.yandex.net/api/v1.5/tr.json/translate",
                  type: "Software",
                  "schema:softwareVersion": "1.5",
                  name: "Yandex Translate API",
                  homepage: "https://tech.yandex.com/translate/"
                }
              });
              console.log(`plus ${lang}`, annotation);
            }
          });
      });
      $.when
        .apply($, lamdas)
        .done(function() {
          storeAnnotation(annotation);
        });
    }
  } else {
    storeAnnotation(annotation);
  }
});
