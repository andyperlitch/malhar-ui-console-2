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

angular.module('app.components.directives.logicalDag.LogicalDagRenderer', [
  'app.components.widgets.dag.DagRenderer'
])
  .factory('LogicalDagRenderer', function (DagRenderer, settings) {
    function LogicalDagRenderer(element, dagPlan) {
      DagRenderer.call(this, element, dagPlan);
      this.streams = dagPlan.streams;
    }

    LogicalDagRenderer.prototype = Object.create(DagRenderer.prototype);
    LogicalDagRenderer.prototype.constructor = DagRenderer;

    angular.extend(LogicalDagRenderer.prototype, {
      /**
       * Adds the labels for metrics above and below each logical operator.
       * @param  {dagre.Digraph} graph The graph object for the DAG.
       * @param  {SVGElement}    d3 selection
       * @return {void}
       */
      postRender: function (graph, root) {
        // add metric label, structure is the following
        // g.node
        // g.node-metric-label
        //   text
        //     tspan

        this.svgNodes = root.selectAll('g .node');

        var that = this;

        this.svgNodes.each(function (d) {
          var nodeSvg = d3.select(this);
          var height = graph.node(d).height;

          that.addMetricLabel(nodeSvg, height);
          that.addMetricLabelDown(nodeSvg, height);
        });

        //this.updateStreams(graph, root);
      },

      addMetricLabel: function (nodeSvg, height) {
        var labelSvg = nodeSvg.append('g').attr('class', 'node-metric-label');
        labelSvg
          .append('text')
          .attr('text-anchor', 'left')
          .append('tspan')
          .attr('dy', '1em');

        var bbox = labelSvg.node().getBBox();

        labelSvg.attr('transform',
            'translate(' + (-bbox.width / 2) + ',' + (-bbox.height - height / 2 - 4) + ')');
      },

      addMetricLabelDown: function (nodeSvg, height) {
        var labelSvg = nodeSvg.append('g').attr('class', 'node-metric2-label');
        labelSvg
          .append('text')
          .attr('text-anchor', 'left')
          .append('tspan')
          .attr('dy', '1em');

        var bbox = labelSvg.node().getBBox();

        labelSvg.attr('transform',
            'translate(' + (-bbox.width / 2) + ',' + (-bbox.height + height + 4) + ')');
      },

      updateMetrics: function () {
        var changed = this.partitionsMetricModel.update(this.collection, true);

        if (changed) {
          this.updatePartitions();
        }

        if (!this.metricModel.isNone()) {
          this.metricModel.update(this.collection);
          this.updateMetricLabels(this.metricModel);
        }

        if (!this.metricModel2.isNone()) {
          this.metricModel2.update(this.collection);
          this.updateMetric2Labels(this.metricModel2);
        }
      },

      updatePartitions: function () {
        var that = this;
        this.svgNodes.each(function (d) {
          var nodeSvg = d3.select(this);

          var multiple = that.partitionsMetricModel.showMetric(d);

          var filter = multiple ? 'url(#f1)' : null;
          //var nodeLabel = nodeSvg.select('.label');
          //nodeLabel.attr('filter', filter);

          var nodeRect = nodeSvg.select('.label > rect');
          nodeRect.attr('filter', filter);
        });
      },

      updateMetricLabels: function (metric) {
        var that = this;
        var graph = this.graph;
        this.svgNodes.each(function (d) {
          var nodeSvg = d3.select(this);
          that.updateMetricLabel(graph, metric, d, nodeSvg);
        });
      },

      updateMetric2Labels: function (metric) {
        var that = this;
        var graph = this.graph;
        this.svgNodes.each(function (d) {
          var nodeSvg = d3.select(this);
          that.updateMetric2Label(graph, metric, d, nodeSvg);
        });
      },

      updateMetricLabel: function (graph, metric, d, nodeSvg) {
        var value = metric.getTextValue(d);
        var showMetric = metric.showMetric(d);

        var metricLabel = nodeSvg.select('.node-metric-label');
        var metricLabelText = metricLabel.select('tspan');

        var text = showMetric ? value : '';
        metricLabelText.text(text);

        var bbox = metricLabel.node().getBBox();
        var height = graph.node(d).height;
        metricLabel.attr('transform',
            'translate(' + (-bbox.width / 2) + ',' + (-bbox.height - height / 2 - 4) + ')');
      },

      updateMetric2Label: function (graph, metric, d, nodeSvg) {
        var value = metric.getTextValue(d);
        var showMetric = metric.showMetric(d);

        var metricLabel = nodeSvg.select('.node-metric2-label');
        var metricLabelText = metricLabel.select('tspan');

        var text = showMetric ? value : '';
        metricLabelText.text(text);

        var bbox = metricLabel.node().getBBox();
        var height = graph.node(d).height;

        metricLabel.attr('transform',
            'translate(' + (-bbox.width / 2) + ',' + (-bbox.height + height + 4) + ')');
      },

      createStreamLocalityMap: function () {
        var streamLocality = {};
        this.streams.forEach(function (stream) {
          if (stream.locality) {
            streamLocality[stream.name] = stream.locality;
          }
        });

        return streamLocality;
      },

      clearStreamLocality: function () {
        this.svgRoot.selectAll('g .edgePath > path').attr('stroke-dasharray', null);
      },

      updateStreams: function () {
        var streamLocality = this.createStreamLocalityMap();
        var graph = this.graph;

        this.svgRoot.selectAll('g .edgePath > path').each(function (d) {
          var value = graph.edge(d);
          var streamName = value.label;

          var locality = streamLocality.hasOwnProperty(streamName) ? streamLocality[streamName] : 'NONE';
          var localityDisplayProperty = settings.dag.edges.hasOwnProperty(locality) ? settings.dag.edges[locality] : settings.dag.edges.NONE;

          if (localityDisplayProperty.dasharray) {
            d3.select(this).attr('stroke-dasharray', localityDisplayProperty.dasharray);
          }
        });
      }
    });

    return LogicalDagRenderer;
  });
