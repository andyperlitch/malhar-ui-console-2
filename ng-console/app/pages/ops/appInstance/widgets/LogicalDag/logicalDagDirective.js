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

angular.module('app.components.directives.logicalDag', [])
  .directive('dtLogicalDag', function (LogicalDagRenderUtil) {
    return {
      restrict: 'A',
      templateUrl: 'pages/ops/appInstance/widgets/LogicalDag/logicalDagDirective.html',
      scope: {
        appId: '='
      },
      link: function postLink(scope, element, attrs) {
        var g = new dagreD3.Digraph();

// Add nodes to the graph. The first argument is the node id. The second is
// metadata about the node. In this case we're going to add labels to each of
// our nodes.
        g.addNode("kspacey",    { label: "Kevin Spacey" });
        g.addNode("swilliams",  { label: "Saul Williams" });
        g.addNode("bpitt",      { label: "Brad Pitt" });
        g.addNode("hford",      { label: "Harrison Ford" });
        g.addNode("lwilson",    { label: "Luke Wilson" });
        g.addNode("kbacon",     { label: "Kevin Bacon" });

// Add edges to the graph. The first argument is the edge id. Here we use null
// to indicate that an arbitrary edge id can be assigned automatically. The
// second argument is the source of the edge. The third argument is the target
// of the edge. The last argument is the edge metadata.
        g.addEdge(null, "kspacey",   "swilliams", { label: "K-PAX" });
        g.addEdge(null, "swilliams", "kbacon",    { label: "These Vagabond Shoes" });
        g.addEdge(null, "bpitt",     "kbacon",    { label: "Sleepers" });
        g.addEdge(null, "hford",     "lwilson",   { label: "Anchorman 2" });
        g.addEdge(null, "lwilson",   "kbacon",    { label: "Telling Lies in America" });


        //var renderer = new dagreD3.Renderer();
        //renderer.run(g, d3.select('.svg-main g'));
        LogicalDagRenderUtil.renderLegend(element);
      }
    };
  })
  .factory('LogicalDagRenderUtil', function (settings) {
    return {
      renderLegend: function (element) {
        var svgParent = jQuery(element).find('.svg-legend'); //TODO no jQuery
        var elem = svgParent.children('g').get(0);
        var legend = d3.select(elem);

        // Create a data array from all dag edge types (in settings)
        // ['NOT ASSIGNED', 'THREAD_LOCAL', 'CONTAINER_LOCAL', 'NODE_LOCAL', 'RACK_LOCAL'];
        var data = _.map( settings.dag.edges, function (displayProperties, locality) {
          // Looks for a 'displayName' key in the properties first,
          // otherwise just makes the key the label.
          var label = displayProperties.displayName ? displayProperties.displayName : locality;
          return {
            label: label,
            dasharray: displayProperties.dasharray
          };
        });

        // Dimensions for location of label and lines
        var baseY = 20;
        var spaceY = 20;
        var lineBaseY = 15;
        var lineBaseX = 160;
        var lineLength = 200;

        // Add the labels to the legend
        legend.selectAll('text')
          .data(data)
          .enter()
          .append('text')
          .attr('y', function (d, i) {
            return baseY + i * spaceY;
          })
          .text(function (d) {
            return d.label;
          });

        // Add the line samples
        var points = [
          {x: lineBaseX},
          {x: lineBaseX + lineLength}
        ];

        legend.selectAll('g .edge')
          .data(data)
          .enter()
          .append('g')
          .classed('edgePath', true)
          .append('path')
          .attr('marker-end', 'url(#arrowhead)')
          .attr('stroke-dasharray', function (d) {
            return d.dasharray;
          })
          .attr('d', function(d, lineIndex) {
            return d3.svg.line()
              .x(function(d, i) {
                return d.x;
              })
              .y(function(d, i) {
                return lineBaseY + lineIndex * spaceY;
              })
            (points);
          });
      }
    };
  });
