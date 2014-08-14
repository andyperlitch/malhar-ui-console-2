/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

angular.module('app.components.services.userStorage', [

])
.provider('userStorage', function() {

  var storage = {};
  var saveFunction = angular.noop;

  return {
    load: function(state) {
      storage = state;
    },
    setSaveFunction: function(fn) {
      saveFunction = fn;
    },
    $get: function() {
      return {

        setItem: function(key, value) {
          storage[key] = value;
          this.save();
        },

        set: function(updates) {
          angular.extend(storage, updates);
        },

        getItem: function(key) {
          return storage[key];
        },

        removeItem: function(key) {
          delete storage[key];
          this.save();
        },

        clear: function() {
          storage = {};
          this.save();
        },

        save: function() {
          saveFunction.call(this);
        },

        load: function(state) {
          storage = state;
          this.save();
        },

        toObject: function(copy) {
          if (copy) {
            return angular.copy(storage);
          }
          return storage;
        },

        serialize: function() {
          return JSON.stringify(storage);
        }

      };
    }
  };
    
});