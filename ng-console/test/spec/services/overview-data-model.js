'use strict';

describe('Service: OverviewDataModel', function () {

  var OverviewDataModel, ds, widgetScope, Widget, sandbox, subscribeSpy;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  // load the service's module
  beforeEach(module('dtConsoleApp', function($provide) {
    $provide.value('getUri', {
      topic: function() {
        return 'some.topic';
      }
    });
    $provide.value('webSocket', {
      subscribe: subscribeSpy = sandbox.spy()
    })
  }));

  // instantiate service
  beforeEach(inject(function (_OverviewDataModel_, $rootScope) {

    OverviewDataModel = _OverviewDataModel_;
    
    widgetScope = $rootScope.$new();
    
    Widget = {
      dataAttrName: 'data',
      dataModelOptions: {
        fields: [],
        topic: 'ExampleTopic',
        url: 'ExampleUrl'
      }
    }

    ds = new OverviewDataModel();
    ds.setup(Widget, widgetScope);

  }));

  afterEach(function() {
    sandbox.restore();
  });

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

    it('should add "topic" and "url" to itself from dataModelOptions', function() {
      expect(ds.topic).to.equal('ExampleTopic');
      expect(ds.url).to.equal('ExampleUrl');
    });

    it('should call "subscribe" on webSocket service', function() {
      expect(subscribeSpy).to.have.been.calledOnce;
    });

  });

});
