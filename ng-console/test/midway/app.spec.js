describe("App Module:", function() {

  var module;
  before(function() {
    module = angular.module("dtConsoleApp");
  });

  it("should be registered", function() {
    expect(module).not.to.equal(null);
  });

  describe("Dependencies:", function() {

    var deps;
    var hasModule = function(m) {
      return deps.indexOf(m) >= 0;
    };
    before(function() {
      deps = module.value('appName').requires;
    });

    // check dependencies
    [
      'templates-main',
      'dtConsoleApp.websocket',
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngRoute',
      'ui.dashboard',
      'mgcrea.ngStrap.navbar',
      'mgcrea.ngStrap.dropdown',
      'ng-breadcrumbs',
      'restangular',
      'ui.notify'
    ].forEach(function(dep) {
      it('should have ' + dep + ' as a dependency', function() {
        expect(hasModule(dep)).to.equal(true);
      });
    });
  });
});
