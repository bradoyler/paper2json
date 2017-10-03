#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const paperToJSON = require('../index')

program
    .arguments('<docId>')
    .option('-o, --output <output>', 'The output file')
    .option('-t, --accessToken <accessToken>', 'access token from Dropbox app')
    .action(function (docId) {
      const { output = 'aml.json', accessToken } = program
      console.log('>>> docId: %s accessToken: %s output: %s', docId, accessToken, output)
      paperToJSON(docId, accessToken)
      .then((aml) => fs.writeFileSync(output, JSON.stringify(aml, null, '\t')))
    }).parse(process.argv)
