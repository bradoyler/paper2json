const fs = require('fs')
const assert = require('assert')
const paperToJSON = require('./../index')

const accessToken = process.env.ACCESS_TOKEN
const docId = 'S7sSIlM2E0g6p3OXhhts4'

// for testing purposes
function debug (doc) {
  console.log('Wrote file test/test.html:', doc)
  fs.writeFileSync('test/test.html', doc.fileBinary.toString())
  return doc
}

if (!accessToken) {
  const htmlFile = fs.readFileSync('test/example.html', 'utf-8')
  const amlFile = fs.readFileSync('test/aml.json', 'utf-8')
  const output = JSON.stringify(paperToJSON.parseHTML({ fileBinary: htmlFile }), null, '\t')
  assert.deepEqual(JSON.parse(amlFile), JSON.parse(output))
  return
}

paperToJSON.getDoc(docId, accessToken)
.then(debug)
.then(html => paperToJSON.parseHTML(html))
.then(debug)
.then((aml) => fs.writeFileSync('test/aml.json', JSON.stringify(aml, null, '\t')))
