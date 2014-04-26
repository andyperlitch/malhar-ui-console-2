var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  var conf = sharedConfig();

  if (conf.reporters.indexOf('coverage') === -1) {
    conf.reporters.push('coverage');  
  }

  // tell karma how you want the coverage results
  conf.coverageReporter = {
    type : 'html',
    // where to store the report
    dir : 'coverage/'
  };

  conf.files = conf.files.concat([
    //extra testing code
    'app/bower_components/angular-mocks/angular-mocks.js',

    //mocha stuff
    // 'test/mocha.conf.js',

    //test files
    './test/spec/**/*.js',

    // template files
    'app/**/*.tpl.html'
  ]);

  // here we specify which of the files we want to appear in the coverage report
  conf.preprocessors = {
    'app/**/*.tpl.html': ['ng-html2js'],
    'app/scripts/**/*.js': ['coverage']
  };

  conf.ngHtml2JsPreprocessor = {
    // strip this from the file path
    stripPrefix: 'app/',

    // setting this option will create only a single module that contains templates
    // from all the files, so you can load them all with module('foo')
    moduleName: 'templates-main'
  }

  config.set(conf);
};
