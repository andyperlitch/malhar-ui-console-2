exports.config = {

  seleniumAddress: 'http://localhost:4444/wd/hub',

  specs: [
    '../app/*_e2e.js',
    '../app/components/**/*_e2e.js',
    '../app/pages/**/*_e2e.js'
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true
  }
};