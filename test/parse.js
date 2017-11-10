const fs = require('fs')
// const assert = require('assert')
const paperToJSON = require('./../index')
const html = fs.readFileSync('test/parse.html')

const aml = paperToJSON.parseHTML({ fileBinary: html })
console.log(aml, '<<<< AML >>>>')
