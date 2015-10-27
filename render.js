/**
 * Dashboard renderer
 *
 * Implementation of Stephen Few's Student Performance Dashboard with Mike Bostock's d3.js library
 *
 * Copyright Robert Monfera
 * Copyright on the design of the Student Performance Dashboard: Stephen Few
 */

var margin = {top: 5, right: 40, bottom: 20, left: 120},
    width = 960 - margin.left - margin.right,
    height = 960 - margin.top - margin.bottom;

function renderHeader(root, vm) {
    bind(root, 'columnHeader')
        .entered
        .attr('transform', translateY(-25))
    bind(root['columnHeader'], 'group', 'g', vm)
    bind(root['columnHeader']['group'], 'headerText', 'text')
        .entered
        .text(key)
        .attr('x', value)
}

function render() {

    /**
     * Root
     */

    var svg = d3.selectAll('svg')

    svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var dashboard = bind(svg, 'dashboard', 'g', [{key: 0}])
    dashboard.entered
        .attr('transform', translateY(38))

    /**
     * Column headers
     */

    var nameColumnWidth = 150
    var cellPadding = 10

    /**
     * Bandline generator
     */

    var assignmentBandLine = bandLine()
        .bands(bands)
        .valueAccessor(property('value'))
        .pointStyleAccessor(outlierScale)
        .xScaleOfBandLine(temporalScale)
        .xScaleOfSparkStrip(temporalScale2)
        .rScaleOfBandLine(bandLinePointRScale)
        .rScaleOfSparkStrip(sparkStripPointRScale)
        .yRange(valueRange)


    /**
     * Rows
     */

    var row = bind(dashboard, 'row', 'g', members)

    row.entered
        .attr('transform', function rowTransform(d, i) {return translateY(i * rowPitch)()})

    bind(row.entered, 'nameCellText', 'text')
        .text(key)
        .attr('y', '0.5em')

    bind(row.entered, 'assignmentScoresCell')
        .attr('transform', translateX(nameColumnWidth + cellPadding))
        .call(assignmentBandLine.renderBandLine)

    bind(row.entered, 'assignmentScoresVerticalCell')
        .attr('transform', translateX(nameColumnWidth + cellPadding + temporalScale.range()[1] + cellPadding))
        .call(assignmentBandLine.renderSparkStrip)
}