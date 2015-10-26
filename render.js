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

var s = calculateScales()

function render() {

    /**
     * Root
     */

    var svg = d3.selectAll('svg')

    var svgWidth = 1280
    var svgHeight = 1025

    svg//.attr({viewBox: [0, 0, svgWidth, svgHeight].join(' ')})
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var dashboard = bind(svg, 'dashboard', 'g', [dashboardData])
    dashboard.entered
        .attr('transform', translateY(38))

    /**
     * Columns
     */

    var topGroups = bind(dashboard, 'topGroups')

    var assignmentScoresGroupX = 200
    var classAssessmentGroupX = 360
    var namesGroup = renderGroupHolder(topGroups, 'namesGroup', 0, 0)
    var assignmentScoresGroup = renderGroupHolder(topGroups, 'assignmentScoresGroup', classAssessmentGroupX - 230, 0)
    var assessmentScoresGroup = renderGroupHolder(topGroups, 'assessmentScoresGroup', classAssessmentGroupX, 0)
    var assignmentScoresAggregateGroup = renderGroupHolder(topGroups, 'assignmentScoresAggregateGroup', assignmentScoresGroupX, 866)


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

    renderHeader(assessmentScoresGroup.group, [
        {key: 'Assessments', value: -10}
    ])


    /**
     * Bandline generators
     */

    var assignmentBandLine = bandLine()
        .bands(s.assignmentBands)
        .valueAccessor(property('assignmentScores'))
        .pointStyleAccessor(s.assignmentOutlierScale)
        .xScaleOfBandLine(s.assignmentScoreTemporalScale)
        .xScaleOfSparkStrip(s.assignmentScoreTemporalScale2)
        .rScaleOfBandLine(s.bandLinePointRScale)
        .rScaleOfSparkStrip(s.sparkStripPointRScale)
        .yRange(s.assignmentScoreVerticalScale.range())
        .yAxis(false)

    var assessmentBandLine = bandLine()
        .bands(s.assessmentBands)
        .valueAccessor(property('standardScores'))
        .pointStyleAccessor(s.assessmentOutlierScale)
        .xScaleOfBandLine(s.assessmentScoreTemporalScale)
        .rScaleOfBandLine(s.bandLinePointRScale)
        .yRange(s.assessmentScoreScale.range())
        .yAxis(false)


    /**
     * Rows
     */

    var rowsRoot = namesGroup.group

    var row = bind(rowsRoot, 'row', 'g', property('Student Data'))

    row.entered
        .attr('transform', function rowTransform(d, i) {return translateY(i * s.rowPitch)()})

    bind(row.entered, 'nameCell')
        .classed('namesGroup', true)
    bind(row.entered['nameCell'], 'nameCellText', 'text')
        .text(key)
        .attr('y', '0.5em')

    bind(row.entered, 'assignmentScoresCell')
        .attr('transform', translateX(assignmentScoresGroupX))
    row.entered['assignmentScoresCell'].call(assignmentBandLine.renderBandLine)
    bind(row.entered, 'assignmentScoresVerticalCell')
        .attr('transform', translateX(assignmentScoresGroupX + 86))
    row.entered['assignmentScoresVerticalCell']
        .call(assignmentBandLine.renderSparkStrip)

    bind(row.entered, 'assessmentScoresCell')
        .attr('transform', translateX(classAssessmentGroupX))
    row.entered['assessmentScoresCell'].call(assessmentBandLine.renderBandLine)
}