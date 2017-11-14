const fs = require('fs')
const assert = require('assert')
const paperToJSON = require('./../index')

const accessToken = process.env.ACCESS_TOKEN
const docId = 'S7sSIlM2E0g6p3OXhhts4'

// for testing purposes
function writeTestFile (doc) {
  const html = Buffer.from(doc.fileBinary, 'binary').toString()
  console.log(html, 'Wrote file test/test.html:')
  fs.writeFileSync('test/test.html', html)
  return doc
}

if (!accessToken) {
  const htmlFile = fs.readFileSync('test/example.txt')
  const amlFile = fs.readFileSync('test/aml.json')
  const output = JSON.stringify(paperToJSON.parseHTML({ fileBinary: htmlFile }), null, '\t')
  try {
    assert.deepEqual(JSON.parse(amlFile), JSON.parse(output))
  } catch (ex) {
    console.log(JSON.parse(amlFile), '<<< expected >>>')
    console.log(JSON.parse(output), '<<< actual >>>')
    throw ex
  }
} else {
  paperToJSON.getDoc(docId, accessToken)
    .then(writeTestFile)
    .then(html => paperToJSON.parseHTML(html))
    .then((aml) => fs.writeFileSync('test/aml.json', JSON.stringify(aml, null, '\t')))
}
