const paper2json = require('./../index')

const accessToken = process.env.ACCESS_TOKEN
const docId = 'badId-S7sSIlM2E0g6p3OXhhts4'

paper2json(docId, accessToken)
  .then(aml => console.log('done:', aml))
  .catch(err => console.log(err))
