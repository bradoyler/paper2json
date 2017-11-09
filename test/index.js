const fs = require('fs')
const assert = require('assert')
const paperToJSON = require('./../index')

const accessToken = process.env.ACCESS_TOKEN
const docId = 'S7sSIlM2E0g6p3OXhhts4'

// for testing purposes
function debug (doc) {
  if (process.env.DEBUG === 'true') {
    console.log('DEBUG:', doc)
  }
  return doc
}

if (!accessToken) {
  const htmlFile = fs.readFileSync('test/example.html', 'utf-8')
  const amlFile = fs.readFileSync('test/aml.json', 'utf-8')
  const output = JSON.stringify(paperToJSON.parseHTML({ fileBinary: htmlFile }), null, '\t')
  assert.deepEqual(JSON.parse(amlFile), JSON.parse(output))
  return
}

paperToJSON.getHTML(docId, accessToken)
.then(debug)
.then(html => paperToJSON.parseHTML(html))
.then(debug)
.then((aml) => fs.writeFileSync('test/aml.json', JSON.stringify(aml, null, '\t')))
