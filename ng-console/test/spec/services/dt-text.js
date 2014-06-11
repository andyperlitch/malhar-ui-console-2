'use strict';

describe('Service: DtText', function () {

  var $log, sandbox;

  // load the service's module
  beforeEach(module('dtConsoleApp', function($provide) {
    $provide.value('$log', $log = {
      warn: function() {}
    })
  }));

  // instantiate service
  var DtText;
  beforeEach(inject(function (_DtText_) {
    DtText = _DtText_;
    sandbox = sinon.sandbox.create();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should be an object', function() {
    expect(DtText).to.be.an('object');
  });

  it('should have a get method', function() {
    expect(DtText.get).to.be.a('function');
  });

  describe('the get method', function() {
    
    it('should return the value if found in the text library', function() {
      var key = 'id_label';
      expect(DtText.get(key)).to.be.a('string');
    });

    it('should return the key itself if it was not found in the text library', function() {
      var key = 'something that is not in the map';
      expect(DtText.get(key)).to.equal(key);
    });

    it('should call $log.warn if the key is not found', function() {
      sandbox.spy($log, 'warn');
      var key = 'something that is not in the map';
      DtText.get(key);
      expect($log.warn).to.have.been.calledOnce;
    });

  });

});