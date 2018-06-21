const env =require('../config');
const makeUrl = (fn, currency) => {
  return `${env.API_URL}?function=${fn}&symbol=${currency}&market=CLP&apikey=${env.API_KEY}`;
}

module.exports = {makeUrl};
