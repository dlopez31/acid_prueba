module.exports = (app, api) => {
  api.get('/', (req, res) => {
      res.json({
          response: 'API Test'
      })
  });
};