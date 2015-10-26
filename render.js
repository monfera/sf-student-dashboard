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

function renderGroupHolder(selection, className, x, y) {

    var group = bind(selection, className)
    group
        .entered
        .attr('transform', translate(x, y))

    var fullClassName = className + '_contents'

    bind(group, fullClassName)
        .entered
        .classed('groupContents', true)

    return {
        group: group[fullClassName],
        className: className
    }
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
     * Columns
     */

    var topGroups = bind(dashboard, 'topGroups')

    var assignmentScoresGroupX = 200
    var namesGroup = renderGroupHolder(topGroups, 'namesGroup', 0, 0)
    var assignmentScoresGroup = renderGroupHolder(topGroups, 'assignmentScoresGroup', 130, 0)


    /**
     * Headers
     */

    renderHeader(namesGroup.group, [
        {key: 'Name', value: 0}
    ])


    renderHeader(assignmentScoresGroup.group, [
        {key: 'Assignments', value: 60},
        {key: 'Spread', value: 160}
    ])


    /**
     * Bandline generators
     */

    var assignmentBandLine = bandLine()
        .bands(assignmentBands)
        .valueAccessor(property('value'))
        .pointStyleAccessor(outlierScale)
        .xScaleOfBandLine(assignmentScoreTemporalScale)
        .xScaleOfSparkStrip(assignmentScoreTemporalScale2)
        .rScaleOfBandLine(bandLinePointRScale)
        .rScaleOfSparkStrip(sparkStripPointRScale)
        .yRange(assignmentScoreVerticalScale.range())


    /**
     * Rows
     */

    var rowsRoot = namesGroup.group

    var row = bind(rowsRoot, 'row', 'g', members)

    row.entered
        .attr('transform', function rowTransform(d, i) {return translateY(i * rowPitch)()})

    bind(row.entered, 'nameCellText', 'text')
        .text(key)
        .attr('y', '0.5em')

    bind(row.entered, 'assignmentScoresCell')
        .attr('transform', translateX(assignmentScoresGroupX))
        .call(assignmentBandLine.renderBandLine)

    bind(row.entered, 'assignmentScoresVerticalCell')
        .attr('transform', translateX(assignmentScoresGroupX + 86))
        .call(assignmentBandLine.renderSparkStrip)
}