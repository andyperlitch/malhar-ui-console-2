exports = module.exports = function(app) {

  var users = [
    { principle: 'andy', password: 'andy', roles: ['admin'] }
  ];

  app.get('/ws/v1/profile/user', function(req, res){
    res.status(401);
    res.json({
      message: 'unauthenticated!'
    });
  });

  app.post('/ws/v1/login', function(req, res) {
    console.log('req.body', req.body);
  });

};