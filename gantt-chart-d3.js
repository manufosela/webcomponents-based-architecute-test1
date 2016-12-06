/**
 * @author: @manufosela
 * @version 0.1
 * @description Gantt diagram with d3 version 4 based in gannt diagram of Dimitry Kudrayvtsev with d3 version 3
 */

d3.gantt = function(selector, mode) {
  mode = mode || 'fit'; // fixed or fit

  var margin = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 150
  };
  selector = selector || 'body';
  var selectorObj = (typeof selector === 'object')?selector:document.body
  var timeDomainStart = d3.timeDay.offset(new Date(), -3);
  var timeDomainEnd = d3.timeHour.offset(new Date(), +3);
  var timeDomainMode = mode;
  var taskTypes = [];
  var taskStatus = [];
  var height = selectorObj.clientHeight - margin.top - margin.bottom - 5;
  var width = selectorObj.clientWidth - margin.right - margin.left - 5;

  var tickFormat = '%H:%M';

  var keyFunction = function(d) {
    return d.start + d.name + d.end;
  };

  var x = d3.scaleTime().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);

  var y = d3.scaleBand().domain(taskTypes).rangeRound([0, height - margin.top - margin.bottom], .1);

  var rectTransform = function(d) {
    return 'translate(' + x(d.start) + ',' + y(d.name) + ')';
  };

  var xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat(tickFormat)).tickSize(8).tickPadding(8);

  var yAxis = d3.axisLeft().scale(y).tickSize(0);

  var initTimeDomain = function(tasks) {
    if (timeDomainMode === 'fit') {
      if (tasks === undefined || tasks.length < 1) {
        timeDomainStart = d3.timeDay.offset(new Date(), -3);
        timeDomainEnd = d3.timeHour.offset(new Date(), +3);
        return;
      }
      tasks.sort(function(a, b) {
        return a.end - b.end;
      });
      timeDomainEnd = tasks[tasks.length - 1].end;
      tasks.sort(function(a, b) {
        return a.start - b.start;
      });
      timeDomainStart = tasks[0].start;
    }
  };

  var initAxis = function() {
    x = d3.scaleTime().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
    y = d3.scaleBand().domain(taskTypes).rangeRound([0, height - margin.top - margin.bottom], .1);
    xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat(tickFormat)).tickSize(8).tickPadding(8);
    yAxis = d3.axisLeft().scale(y).tickSize(0);
  };

  function gantt(tasks) {

    initTimeDomain(tasks);
    initAxis();

    var svg = d3.select(selector)
      .append('svg')
      .attr('class', 'chart ' + this.is)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('class', 'gantt-chart ' + this.is)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    svg.selectAll('.chart')
      .data(tasks, keyFunction).enter()
      .append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('class', function(d) {
        if (taskStatus[d.state] === null) {
          return 'bar ' + this.is;
        }
        return taskStatus[d.state];
      })
      .attr('y', 0)
      .attr('transform', rectTransform)
      .attr('height', function(d) {
        return y.rangeBand();
      })
      .attr('width', function(d) {
        return Math.max(1, (x(d.end) - x(d.start)));
      });


    svg.append('g')
      .attr('class', 'x axis ' + this.is)
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
      .transition()
      .call(xAxis);

    svg.append('g').attr('class', 'y axis ' + this.is).transition().call(yAxis);

    return gantt;

  }

  gantt.redraw = function(tasks) {

    initTimeDomain(tasks);
    initAxis();

    var svg = d3.select('.chart');

    var ganttChartGroup = svg.select('.gantt-chart');
    var rect = ganttChartGroup.selectAll('rect').data(tasks, keyFunction);

    rect.enter()
      .insert('rect', ':first-child')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('class', function(d) {
        if (taskStatus[d.state] === null) {
          return 'bar ' + this.is;
        }
        return taskStatus[d.state];
      })
      .transition()
      .attr('y', 0)
      .attr('transform', rectTransform)
      .attr('height', function(d) {
        return y.range()[y.range().length-1]/d._length;
      })
      .attr('width', function(d) {
        return Math.max(1, (x(d.end) - x(d.start)));
      });

    rect.transition()
      .attr('transform', rectTransform)
      .attr('height', function(d) {
        return y.range()[y.range().length-1]/d._length;
      })
      .attr('width', function(d) {
        return Math.max(1, (x(d.end) - x(d.start)));
      });

    rect.exit().remove();

    svg.select('.x').transition().call(xAxis);
    svg.select('.y').transition().call(yAxis);

    return gantt;
  };

  gantt.margin = function(value) {
    if (!arguments.length) {
      return margin;
    }
    margin = value;
    return gantt;
  };

  gantt.timeDomain = function(value) {
    if (!arguments.length) {
      return [timeDomainStart, timeDomainEnd];
    }
    timeDomainStart = +value[0];
    timeDomainEnd = +value[1];
    return gantt;
  };

  /**
   * @param {string}
   *                vale The value can be 'fit' - the domain fits the data or
   *                'fixed' - fixed domain.
   */
  gantt.timeDomainMode = function(value) {
    if (!arguments.length) {
      return timeDomainMode;
    }
    timeDomainMode = value;
    return gantt;

  };

  gantt.taskTypes = function(value) {
    if (!arguments.length) {
      return taskTypes;
    }
    taskTypes = value;
    return gantt;
  };

  gantt.taskStatus = function(value) {
    if (!arguments.length) {
      return taskStatus;
    }
    taskStatus = value;
    return gantt;
  };

  gantt.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = +value;
    return gantt;
  };

  gantt.height = function(value) {
    if (!arguments.length) {
      return height;
    }
    height = +value;
    return gantt;
  };

  gantt.tickFormat = function(value) {
    if (!arguments.length) {
      return tickFormat;
    }
    tickFormat = value;
    return gantt;
  };

  gantt.selector = function(value) {
    if (!arguments.length) {
      return selector;
    }
    selector = value;
    return gantt;
  };

  return gantt;
};