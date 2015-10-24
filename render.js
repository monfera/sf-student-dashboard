/**
 * Dashboard renderer
 *
 * Implementation of Stephen Few's Student Performance Dashboard with Mike Bostock's d3.js library
 *
 * Copyright Robert Monfera
 * Copyright on the design of the Student Performance Dashboard: Stephen Few
 */

var duration = 200
var UNICODE_UP_DOWN_ARROW = '\u21d5'

function renderPetiteHeader(root, vm, fontSize) {
    bind(root, 'petiteColumnHeader')
        .entered
        .attr('transform', translateY(-25))
    bind(root['petiteColumnHeader'], 'group', 'g', vm)
    bind(root['petiteColumnHeader']['group'], 'helpText', 'title')
        .entered
        .text(function(d) {
            var variable = findWhere('petiteHeaderAlias', d.key)(dashboardVariables)
            return variable ? variable.helpText : ''
        })
    bind(root['petiteColumnHeader']['group'], 'headerText', 'text')
        .text(function(d) {return sortedByThis('petiteHeaderAlias', d.key) ? d.key + '' + UNICODE_UP_DOWN_ARROW : d.key})
        .entered
        .classed('interactive', property('interactive'))
        .on('mousedown', function(d) {setPetiteHeaderTableSortOrder(d.key, d)})
        .on('mouseup', resetTableSortOrder)
        .attr('x', value)
        .attr('opacity', 1)
    root['petiteColumnHeader']['group']['headerText']
        .entered
        .filter(property('fontSize'))
        .attr('font-size', property('fontSize'))
}

function render() {

    var s = calculateScales()

    /**
     * Root
     */

    var svgWidth = 1280
    var svgHeight = 1025

    root
        .style({
            width: '100%',
            height: '100%'
        })
        .attr({viewBox: [0, 0, svgWidth, svgHeight].join(' ')})

    var dashboard = bind(root, 'dashboard', 'g', [dashboardData])


    /**
     * Main dashboard rectangle
     */

    var mainRectangleTop = bind(dashboard, 'mainRectangleTop', 'g')

    var mainRectangleTopLeft = bind(mainRectangleTop, 'mainRectangleTop', 'g')


    /**
     * Headers
     */

    function renderHeader(root, text, sortedByThis, aggregate) {

        var header = bind(root, 'header')

        bind(header, 'headerTitle', 'text')
            .text(sortedByThis ? text + '' + UNICODE_UP_DOWN_ARROW : text)
            .entered
            .attr({
                y: -6
            })

        return header
    }

    function renderGroupHolder(selection, className, title, x, y, y2, aggregate) {

        var group = bind(selection, className)
        group
            .entered
            .attr('transform', translate(x, y))

        var groupHeader = renderHeader(group, title, sortedByThis('groupAlias', className), aggregate)
        groupHeader
            .entered
            .on('mousedown', setGroupHeaderTableSortOrder.bind(0, className))
            .on('mouseup', resetTableSortOrder)

        var fullClassName = className + '_contents'

        bind(group, fullClassName)
            .entered
            .classed('groupContents', true)
            .attr('transform', translateY(y2))

        return {
            group: group[fullClassName],
            className: className,
            legendGroup: groupHeader
        }
    }

    /**
     * Contents
     */

    var contents = bind(mainRectangleTopLeft, 'contents')
    contents
        .entered
        .classed('globalContentPlacementY', true)
        .attr('transform', translateY(24.5))


    /**
     * Top header rows
     */

    var topGroups = bind(contents, 'topGroups')

    var assignmentScoresGroupX = 408.5
    var topGroupContentsY = 38
    var classAssessmentGroupX = 747.5
    var namesGroup = renderGroupHolder(topGroups, 'namesGroup', 'Student', 0, 0, topGroupContentsY)
    var assignmentScoresGroup = renderGroupHolder(topGroups, 'assignmentScoresGroup', 'Assignments', classAssessmentGroupX - 230, 0, topGroupContentsY)
    var assessmentScoresGroup = renderGroupHolder(topGroups, 'assessmentScoresGroup', 'Assessments', classAssessmentGroupX, 0, topGroupContentsY)

    /**
     * Aggregate row
     */

    var aggregateGroupY = 926

    var sideGroups = bind(contents, 'sideGroups')
    sideGroups
        .entered
        .attr('transform', translate(0, aggregateGroupY))

    var assignmentScoresAggregateGroup = renderGroupHolder(sideGroups, 'assignmentScoresAggregateGroup', '', 0, -21, 0, true)


    /**
     * Legends
     */

    function offsetLegends(selection) {selection.entered.attr('transform', translate(2, -130))}

    ;(function assignmentScoreLegends(group) {

        var root = group.legendGroup

        bind(root, 'groupLegends').call(offsetLegends)

        renderPetiteHeader(group.group, [
            {key: 'YTD', value: -90, interactive: true},
            {key: 'Spread', value: -21, interactive: true}
        ])

    })(assignmentScoresGroup)

    ;(function assessmentLegends(root) {

        renderPetiteHeader(root, [
            {key: 'Last 5', value: 12, interactive: true}
        ])

    })(assessmentScoresGroup.group)


    /**
     * Rows
     */

    var rowsRoot = namesGroup.group
    var rowSelection = bind(rowsRoot, 'row', 'g', makeRowData)
    var row = rowSelection.entered
    function rowTransform(d, i) {return translateY(i * s.rowPitch)()}

    row
        .attr({'transform': rowTransform})
    rowSelection
        .transition().duration(duration * 4)
        .attr({'transform': rowTransform})

    bind(rowSelection, 'rowBackground', 'rect')
        .attr('fill-opacity', function(d) {return dashboardSettings.table.studentSelection.selectedStudents[d.key] ? 0.025 : 0})
        .entered
        .attr({
            width: 1328 - 48,
            height: s.rowPitch,
            x: -46,
            y: - s.rowPitch / 2 + 0.5
        })

    bind(row, 'nameCell')
        .entered
        .classed('namesGroup', true)
    bind(row['nameCell'], 'nameCellText', 'text')
        .entered
        .text(key)
        .attr({
            y: '0.5em'
        })
        .attr({
            'transform': translateX(0)
        })

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

    bind(row, 'assignmentScoresCell')
        .entered
        .attr('transform', translateX(assignmentScoresGroupX))
    row['assignmentScoresCell'].entered.call(assignmentBandLine.renderBandLine)

    bind(row, 'assignmentScoresVerticalCell')
        .entered
        .attr('transform', translateX(assignmentScoresGroupX + 86))
    ;(function renderAssignmentScoresVertical(root) {
        root.call(assignmentBandLine.renderSparkStrip)

    })(row['assignmentScoresVerticalCell'].entered)

    bind(row, 'assessmentScoresCell')
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
    ;(function renderAssessmentScores(root) {
        root.call(assessmentBandLine.renderBandLine)

    })(row['assessmentScoresCell'].entered)

    ;(function renderAssignmentScoresAggregates(root) {
        bind(root, 'assignmentAggregateMetrics', 'g', function(d) {
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
        })
            .entered
            .attr('transform', translateX(408.5))
            .attr('opacity', 1)

        var aggregateAssignmentBandLine = bandLine()
            .bands(s.assignmentBands)
            .valueAccessor(property('assignmentScores'))
            .pointStyleAccessor(s.assignmentOutlierScale)
            .xScaleOfBandLine(s.assignmentScoreTemporalScale)
            .rScaleOfBandLine(s.bandLinePointRScale)
            .yRange(s.assignmentScoreVerticalScaleLarge.range())
            .yAxis(d3.svg.axis().orient('right').ticks(4).tickFormat(d3.format('%')))
        root['assignmentAggregateMetrics'].call(aggregateAssignmentBandLine.renderBandLine)

        bind(row, 'rowCaptureZone', 'rect')
            .on(rowInteractions)
            .attr({
                width: 1328 - 48,
                height: s.rowPitch,
                x: -46,
                y: - s.rowPitch / 2 + 0.5
            })

    })(assignmentScoresAggregateGroup.group)
}