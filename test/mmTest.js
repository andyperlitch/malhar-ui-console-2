var Minimatch = require('minimatch').Minimatch;
var mm = new Minimatch('app/components/**/!(*_test)+(.js)');

console.log(mm.match('app/components/services/my-service.js'), 'should match non-test files');
console.log(!mm.match('app/components/services/my-service_test.js'), 'should NOT match test files');
