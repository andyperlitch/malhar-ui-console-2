/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

/*!
 * isVis - v0.5.5 Aug 2011 - Page Visibility API Polyfill
 * Copyright (c) 2011 Addy Osmani
 * Dual licensed under the MIT and GPL licenses.
 *
 * Updates by DataTorrent Inc.
 */
'use strict';

angular.module('app.components.services.visibly', [])
 .factory('visibly', function ($document, $window) {

  var visibly = {
    q: $document,
    p: undefined,
    prefixes: ['webkit', 'ms','o','moz','khtml'],
    props: ['VisibilityState', 'visibilitychange', 'Hidden'],
    m: ['focus', 'blur'],
    visibleCallbacks: [],
    hiddenCallbacks: [],
    genericCallbacks:[],
    _callbacks: [],
    cachedPrefix:'',
    fn:null,

    onVisible: function (_callback) {
      if(typeof _callback === 'function' ){
        this.visibleCallbacks.push(_callback);
      }
    },
    onHidden: function (_callback) {
      if(typeof _callback === 'function' ){
        this.hiddenCallbacks.push(_callback);
      }
    },
    getPrefix:function(){
      if(!this.cachedPrefix){
        var b;
        for(var l=0; this.prefixes.indexOf(l) > -1; l++){
          b = this.prefixes[l];
          if(b + this.props[2] in this.q){
            this.cachedPrefix =  b;
            return this.cachedPrefix;
          }
        }
      }
    },

    visibilityState:function(){
      return  this._getProp(0);
    },
    hidden:function(){
      return this._getProp(2);
    },
    visibilitychange:function(fn){
      if(typeof fn === 'function' ){
        this.genericCallbacks.push(fn);
      }

      var n =  this.genericCallbacks.length;
      if(n){
        if(this.cachedPrefix){
          while(n--){
            this.genericCallbacks[n].call(this, this.visibilityState());
          }
        }else{
          while(n--){
            this.genericCallbacks[n].call(this, arguments[0]);
          }
        }
      }

    },
    isSupported: function () {
      return ((this.cachedPrefix + this.props[2]) in this.q);
    },
    _getProp:function(index){
      return this.q[this.cachedPrefix + this.props[index]];
    },
    _execute: function (index) {
      if (index) {
        this._callbacks = (index === 1) ? this.visibleCallbacks : this.hiddenCallbacks;
        var n =  this._callbacks.length;
        while(n--){
          this._callbacks[n]();
        }
      }
    },
    _visible: function () {
      visibly._execute(1);
      visibly.visibilitychange.call(visibly, 'visible');
    },
    _hidden: function () {
      visibly._execute(2);
      visibly.visibilitychange.call(visibly, 'hidden');
    },
    _nativeSwitch: function () {
      this[this._getProp(2) ? '_hidden' : '_visible']();
    },
    _listen: function () {
      try { /*if no native page visibility support found..*/
        if (!(this.isSupported())) {
          if (this.q.addEventListener) { /*for browsers without focusin/out support eg. firefox, opera use focus/blur*/
            $window.addEventListener(this.m[0], this._visible, 1);
            $window.addEventListener(this.m[1], this._hidden, 1);
          } else { /*IE <10s most reliable focus events are onfocusin/onfocusout*/
            if (this.q.attachEvent) {
              this.q.attachEvent('onfocusin', this._visible);
              this.q.attachEvent('onfocusout', this._hidden);
            }
          }
        } else { /*switch support based on prefix detected earlier*/
          this.q.addEventListener(this.cachedPrefix + this.props[1], function () {
            visibly._nativeSwitch.apply(visibly, arguments);
          }, 1);
        }
      } catch (e) {}
    },
    init: function () {
      this.getPrefix();
      this._listen();
    }
  };

  visibly.init();

  return visibly;
});
