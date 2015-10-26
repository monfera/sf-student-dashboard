/**
 * Dashboard renderer
 *
 * Implementation of Stephen Few's Student Performance Dashboard with Mike Bostock's d3.js library
 *
 * Copyright Robert Monfera
 * Copyright on the design of the Student Performance Dashboard: Stephen Few
 */

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

function aggregateAssignmentScores(d) {
    var students = d["Student Data"]
    var scores = pluck('assignmentScores')(students)
    var totalsRow = {
        key: 'totalsRow',
        assignmentScores: [
            d3.mean(pluck(0)(scores).filter(identity)),
            d3.mean(pluck(1)(scores).filter(identity)),
            d3.mean(pluck(2)(scores).filter(identity)),
            d3.mean(pluck(3)(scores).filter(identity)),
            d3.mean(pluck(4)(scores).filter(identity))
        ]
    }
    return [totalsRow]
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

    var root = d3.selectAll('svg')

    var svgWidth = 1280
    var svgHeight = 1025

    root.attr({viewBox: [0, 0, svgWidth, svgHeight].join(' ')})

    var dashboard = bind(root, 'dashboard', 'g', [dashboardData])
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
     * Rows
     */

    var rowsRoot = namesGroup.group
    var row = bind(rowsRoot, 'row', 'g', makeRowData)
    function rowTransform(d, i) {return translateY(i * s.rowPitch)()}

    row.entered
        .attr('transform', rowTransform)
    row
        .transition().duration(1000)
        .attr('transform', rowTransform)

    bind(row.entered, 'nameCell')
        .classed('namesGroup', true)
    bind(row.entered['nameCell'], 'nameCellText', 'text')
        .text(key)
        .attr('y', '0.5em')

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
    bind(row.entered, 'assignmentScoresCell')
        .attr('transform', translateX(assignmentScoresGroupX))
    row.entered['assignmentScoresCell'].call(assignmentBandLine.renderBandLine)
    bind(row.entered, 'assignmentScoresVerticalCell')
        .attr('transform', translateX(assignmentScoresGroupX + 86))
    row.entered['assignmentScoresVerticalCell']
        .call(assignmentBandLine.renderSparkStrip)

    bind(row.entered, 'assessmentScoresCell')
        .attr('transform', translateX(classAssessmentGroupX))
    var assessmentBandLine = bandLine()
        .bands(s.assessmentBands)
        .valueAccessor(property('standardScores'))
        .pointStyleAccessor(s.assessmentOutlierScale)
        .xScaleOfBandLine(s.assessmentScoreTemporalScale)
        .rScaleOfBandLine(s.bandLinePointRScale)
        .yRange(s.assessmentScoreScale.range())
        .yAxis(false)
    row.entered['assessmentScoresCell'].call(assessmentBandLine.renderBandLine)

    bind(assignmentScoresAggregateGroup.group, 'assignmentAggregateMetrics', 'g', aggregateAssignmentScores)
    var aggregateAssignmentBandLine = bandLine()
        .bands(s.assignmentBands)
        .valueAccessor(property('assignmentScores'))
        .pointStyleAccessor(s.assignmentOutlierScale)
        .xScaleOfBandLine(s.assignmentScoreTemporalScale)
        .rScaleOfBandLine(s.bandLinePointRScale)
        .yRange(s.assignmentScoreVerticalScaleLarge.range())
        .yAxis(d3.svg.axis().orient('right').ticks(4).tickFormat(d3.format('%')))
    assignmentScoresAggregateGroup.group['assignmentAggregateMetrics'].call(aggregateAssignmentBandLine.renderBandLine)
}