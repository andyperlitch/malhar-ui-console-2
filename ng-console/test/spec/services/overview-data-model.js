'use strict';

describe('Service: OverviewDataModel', function () {

  // load the service's module
  beforeEach(module('dtConsoleApp'));

  
  var OverviewDataModel, ds, widgetScope, Widget;

  // instantiate service
  beforeEach(inject(function (_OverviewDataModel_, $rootScope) {

    OverviewDataModel = _OverviewDataModel_;
    
    widgetScope = $rootScope.$new();
    
    Widget = {
      dataAttrName: 'data',
      dataModelOptions: {
        fields: []
      }
    }

    ds = new OverviewDataModel();
    ds.setup(Widget, widgetScope);

  }));

  it('should be a function', function () {
    expect(OverviewDataModel).to.be.a('function');
  });

  it('should have an init, destroy, updateScope, and setup methods from WidgetDataModel', inject(function(WidgetDataModel) {
    expect(OverviewDataModel.prototype.setup).to.equal(WidgetDataModel.prototype.setup);
    expect(OverviewDataModel.prototype.updateScope).to.equal(WidgetDataModel.prototype.updateScope);
  }));

  describe('init method', function() {
    
    beforeEach(function() {
      ds.init();
    });

    it('should add "fields" to the widget scope', function() {
      expect(widgetScope.fields).to.equal(Widget.dataModelOptions.fields);
    });



  });

});
