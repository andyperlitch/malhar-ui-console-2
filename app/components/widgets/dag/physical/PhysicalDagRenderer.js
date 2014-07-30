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

'use strict';

angular.module('app.components.directives.dag.PhysicalDagRenderer', [
  'app.components.directives.logicalDag.LogicalDagRenderer'
])
  .factory('PhysicalDagRenderer', function (LogicalDagRenderer) {
    function PhysicalDagRenderer(element, dagPlan) {
      LogicalDagRenderer.call(this, element, dagPlan);
    }

    PhysicalDagRenderer.prototype = Object.create(LogicalDagRenderer.prototype);
    PhysicalDagRenderer.prototype.constructor = LogicalDagRenderer;

    angular.extend(PhysicalDagRenderer.prototype, {
      buildGraph: function(data) {
        var nodes = [];
        var containers = {};
        var containerCount = 0;
        var nodeMap = this.nodeMap = {};

        _.each(data.operators, function(value) {
          var containerId = value.container;
          var containerIndex;
          if (containers.hasOwnProperty(containerId)) {
            containerIndex = containers[containerId];
          } else {
            containerIndex = containerCount++;
            containers[containerId] = containerIndex;
          }

          var label = value.name;
          var node = { id: value.id, value: { label: label }, containerIndex: containerIndex, data: value };
          nodes.push(node);
          nodeMap[node.id] = node;
        });

        var links = [];

        _.each(data.streams, function(stream) {
          var source = stream.source.operatorId;
          _.each(stream.sinks, function(sink) {
            var target = sink.operatorId;
            //var link = { u: source, v: target };
            var link = { u: source, v: target, value: { label: stream.logicalName } };
            links.push(link);
          });
        });

        var graph = { nodes: nodes, links: links, nodeMap: nodeMap };
        return graph;
      },

      postRender: function(graph, root) {
        this.graph = graph;
        this.svgRoot = root;

        var nodeMap = this.nodeMap;
        var colors = d3.scale.category20(); //TODO do not limit to 20 colors

        root.selectAll('.node > rect').style('stroke', function(key) {
          var node = nodeMap[key];
          var color = colors(node.containerIndex % 20);
          return color;
        });
      }
    });

    return PhysicalDagRenderer;
  });
