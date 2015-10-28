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
    height = 480 - margin.top - margin.bottom;

function render() {

    /**
     * Root
     */

    var svg = d3.selectAll('svg')

    svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var dashboard = bind(svg, 'dashboard', 'g', [{key: 0}])

    /**
     * Column headers
     */

    var nameColumnWidth = 160
    var cellPadding = 10

    /**
     * Bandline generator
     */

    var assignmentBandLine = bandLine()
        .bands(bands)
        .valueAccessor(property('value'))
        .pointStyleAccessor(outlierScale)
        .xScaleOfBandLine(temporalScale)
        .xScaleOfSparkStrip(horizontalValueScale)
        .rScaleOfBandLine(bandLinePointRScale)
        .rScaleOfSparkStrip(sparkStripPointRScale)
        .yRange(valueRange)


    /**
     * Headers
     */

    bind(dashboard, 'header', 'text', [{key: 'Name'}, {key: 'Tser'}, {key: 'Spread'}])
        .entered
        .text(key)
        .attr('transform', translate(function(d, i) {return [0, nameColumnWidth + cellPadding, nameColumnWidth + cellPadding + temporalScale.range()[1] + cellPadding][i]}, rowPitch))


    /**
     * Rows
     */

    var enteredRow = bind(dashboard, 'row', 'g', tsers).entered

    enteredRow.attr('transform', function rowTransform(d, i) {return translateY((i + 2) * rowPitch)()})

    bind(enteredRow, 'nameCellText', 'text')
        .text(key)
        .attr('y', '0.5em')

    bind(enteredRow, 'assignmentScoresCell')
        .attr('transform', translateX(nameColumnWidth + cellPadding))
        .call(assignmentBandLine.renderBandLine)

    bind(enteredRow, 'assignmentScoresVerticalCell')
        .attr('transform', translateX(nameColumnWidth + cellPadding + temporalScale.range()[1] + cellPadding))
        .call(assignmentBandLine.renderSparkStrip)
}