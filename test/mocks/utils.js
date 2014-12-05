'use strict';

angular.isPromise = function (obj) {
  return angular.isObject(obj) && typeof obj.then === 'function';
};