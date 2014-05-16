'use strict';

describe('Service: widgets/dtOverview/clusterMetricsOverviewFields', function () {

  // load the service's module
  beforeEach(module('dtConsoleApp'));

  // instantiate service
  var widgets_dtOverview_clusterMetricsOverviewFields;
  beforeEach(inject(function (_widgets_dtOverview_clusterMetricsOverviewFields_) {
    widgets_dtOverview_clusterMetricsOverviewFields = _widgets_dtOverview_clusterMetricsOverviewFields_;
  }));

  it('should do something', function () {
    expect(!!widgets_dtOverview_clusterMetricsOverviewFields).toBe(true);
  });

});
