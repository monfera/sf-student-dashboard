/**
 * Dashboard renderer
 *
 * Implementation of Stephen Few's Student Performance Dashboard with Mike Bostock's d3.js library
 *
 * Copyright Robert Monfera
 * Copyright on the design of the Student Performance Dashboard: Stephen Few
 */

var UNICODE_UP_DOWN_ARROW = '\u21d5'

function renderHeader(root, vm) {
    bind(root, 'columnHeader')
        .entered
        .attr('transform', translateY(-25))
    bind(root['columnHeader'], 'group', 'g', vm)
    bind(root['columnHeader']['group'], 'headerText', 'text')
        .text(function(d) {return sortedByThis('key', d.key) ? d.key + '' + UNICODE_UP_DOWN_ARROW : d.key})
        .entered
        .classed('interactive', true)
        .on('mousedown', function(d) {setHeaderTableSortOrder(d.key, d)})
        .on('mouseup', resetTableSortOrder)
        .attr('x', value)
}

function aggregateAssignmentScores(d) {
    var students = keptStudentData(d)
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
     * Headers
     */

    var topGroups = bind(dashboard, 'topGroups')

    var assignmentScoresGroupX = 200
    var classAssessmentGroupX = 360
    var namesGroup = renderGroupHolder(topGroups, 'namesGroup', 0, 0)
    var assignmentScoresGroup = renderGroupHolder(topGroups, 'assignmentScoresGroup', classAssessmentGroupX - 230, 0)
    var assessmentScoresGroup = renderGroupHolder(topGroups, 'assessmentScoresGroup', classAssessmentGroupX, 0)
    var assignmentScoresAggregateGroup = renderGroupHolder(topGroups, 'assignmentScoresAggregateGroup', assignmentScoresGroupX, 866)


    /**
     * Legends
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
    var rowSelection = bind(rowsRoot, 'row', 'g', makeRowData)
    function rowTransform(d, i) {return translateY(i * s.rowPitch)()}

    rowSelection.entered
        .attr('transform', rowTransform)
    rowSelection
        .transition().duration(1000)
        .attr('transform', rowTransform)

    bind(rowSelection, 'rowBackground', 'rect')
        .attr('fill-opacity', function(d) {return dashboardSettings.table.studentSelection.selectedStudents[d.key] ? 0.025 : 0})
        .entered
        .attr({
            width: 450,
            height: s.rowPitch,
            y: - s.rowPitch / 2
        })

    bind(rowSelection.entered, 'nameCell')
        .entered
        .classed('namesGroup', true)
    bind(rowSelection.entered['nameCell'], 'nameCellText', 'text')
        .entered
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
    bind(rowSelection.entered, 'assignmentScoresCell')
        .entered
        .attr('transform', translateX(assignmentScoresGroupX))
    rowSelection.entered['assignmentScoresCell'].entered.call(assignmentBandLine.renderBandLine)
    bind(rowSelection.entered, 'assignmentScoresVerticalCell')
        .entered
        .attr('transform', translateX(assignmentScoresGroupX + 86))
    rowSelection.entered['assignmentScoresVerticalCell']
        .entered
        .call(assignmentBandLine.renderSparkStrip)

    bind(rowSelection.entered, 'assessmentScoresCell')
        .entered
        .attr('transform', translateX(classAssessmentGroupX))
    var assessmentBandLine = bandLine()
        .bands(s.assessmentBands)
        .valueAccessor(property('standardScores'))
        .pointStyleAccessor(s.assessmentOutlierScale)
        .xScaleOfBandLine(s.assessmentScoreTemporalScale)
        .rScaleOfBandLine(s.bandLinePointRScale)
        .yRange(s.assessmentScoreScale.range())
        .yAxis(false)
    rowSelection.entered['assessmentScoresCell'].entered.call(assessmentBandLine.renderBandLine)

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

    bind(rowSelection.entered, 'rowCaptureZone', 'rect')
        .on(rowInteractions)
        .attr({
            width: 450,
            height: s.rowPitch,
            x: -46,
            y: - s.rowPitch / 2
        })
}