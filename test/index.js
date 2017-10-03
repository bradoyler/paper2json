const paperToJSON = require('./../index')

const accessToken = process.env.ACCESS_TOKEN
const docId = 'S7sSIlM2E0g6p3OXhhts4'

paperToJSON(docId, accessToken)
.then((out) => console.log('Yay!', out))
