'use strict';

function addErrorCalls(app, errorCode) {

  errorCode = errorCode || 404;

  app.get('/ws/v1/config/properties/dt.dfsRootDirectory', function(req, res) {
    console.log('MOCK REQUEST TO GET DFS ROOT DIR. FAILING PURPOSEFULLY.');
    res.status(errorCode);
    res.json({
      message: 'No DFS root directory is set'
    });
  });

  app.get('/ws/v1/config/hadoopExecutable', function(req, res) {
    console.log('MOCK REQUEST TO GET HADOOP EXEC. FAILING PURPOSEFULLY.');
    res.status(errorCode);
    res.json({
      message: 'Hadoop executable could not be found'
    });
  });

  app.post('/ws/v1/licenses/files/:filename/makeCurrent', function(req, res) {
    console.log('MOCK REQUEST TO MAKE LICENSE CURRENT. FAILING PURPOSEFULLY.');
    setTimeout(function() {
      res.status(errorCode).send('Could not make license current');
    }, 1000);
  });

}


exports = module.exports = {
  addErrorCalls: addErrorCalls
};