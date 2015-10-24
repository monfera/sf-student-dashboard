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
var layoutGray = 'rgb(231, 231, 233)'
var mainRectangleLeft = 48
var mainRectangleWidth = 1260

var layout, l

function calculateGlobals() {

    layout = {
        mainRectangleTop: 38
    }

    l = {

        mainTitleDecoratorColor: layoutGray,
        mainTitleDecoratorHeight: layout.mainRectangleTop,
        mainTitleDecoratorY: -layout.mainRectangleTop,

    }
}

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
        .attr({
            x: value
        })
        .attr('opacity', 1)
    root['petiteColumnHeader']['group']['headerText']
        .entered
        .filter(property('fontSize'))
        .attr('font-size', property('fontSize'))
}

function render() {

    var s = calculateScales()
    calculateGlobals()

    /**
     * Root
     */

    var svgWidth = 1280
    var svgHeight = 1025

    root
        .style({
            'background-color': 'rgb(255, 255, 251)',
            width: '100%',
            height: '100%'
        })
        .attr({viewBox: [0, 0, svgWidth, svgHeight].join(' ')})

    var dashboard = bind(root, 'dashboard', 'g', [dashboardData])


    /**
     * Main dashboard rectangle
     */

    var mainRectangleTop = bind(dashboard, 'mainRectangleTop', 'g')
    mainRectangleTop
        .entered
        .attr({transform: translateY(layout.mainRectangleTop)})

    var mainRectangleTopLeft = bind(mainRectangleTop, 'mainRectangleTop', 'g')
    mainRectangleTopLeft
        .entered
        .attr({transform: translateX(mainRectangleLeft)})


    /**
     * Dashboard title and date
     */

    bind(mainRectangleTopLeft, 'mainRectangleTopBar', 'rect')
        .entered
        .attr({
            width: mainRectangleWidth + mainRectangleLeft - 24,
            height: l.mainTitleDecoratorHeight,
            x: -mainRectangleLeft - 2,
            y: l.mainTitleDecoratorY,
            fill: l.mainTitleDecoratorColor,
        })

    var topOfRows = 45
    var bottomOfRows = 896
    var bottomOfReport = 986
    var leftOfColumns =  -mainRectangleLeft
    var rightOfColumns = 1280 + leftOfColumns

    bind(mainRectangleTopLeft, 'verticalGridBars', 'line', [
        {key: 'student', value: leftOfColumns , size: 2},
        {key: 'special', value: 143, size: 1},
        {key: 'grade', value: 194, size: 2},
        {key: 'assignments', value: 392, size: 2},
        {key: 'lastLeft', value: 560, size: 1},
        {key: 'lastMiddle', value: 608, size: 0},
        {key: 'lastRight', value: 658, size: 1},
        {key: 'assessments', value: 726, size: 2},
        {key: 'attendance', value: 868, size: 2},
        {key: 'nowLine', value: 1055, size: 0},
        {key: 'behavior', value: 1115, size: 2},
        {key: 'rightEdge', value: rightOfColumns, size: 2}
    ]).entered
        .attr({
            x1: value,
            x2: value,
            y1: function(d) {return d.size === 2 ? 0 : topOfRows},
            y2: function(d) {return (d.size === 2 || d.key === 'nowLine' ? bottomOfReport : bottomOfRows)},
            'stroke-width': function(d) {return [0.8, 2, 4][d.size]},
            stroke: layoutGray
        })

    bind(mainRectangleTopLeft, 'horizontalGridBars', 'line', [
        {key: 'topOfRows', value: topOfRows , size: 2},
        {key: 'bottomOfRows', value: bottomOfRows, size: 2},
        {key: 'bottomOfReport', value: bottomOfReport, size: 1}
    ]).entered
        .attr({
            y1: value,
            y2: value,
            x1: leftOfColumns,
            x2: rightOfColumns,
            'stroke-width': function(d) {return [1, 2, 4][d.size]},
            stroke: layoutGray
        })

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

        // fixme merge some properties (interactive, helpText) into the variable Model
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
        .attr('fill-opacity', function(d) {return dashboardSettings.table.studentSelection.selectedStudents[d.key] ? 0.05 : 0})
        .entered
        .attr({
            width: 1328 - 48,
            height: s.rowPitch,
            x: -46,
            y: - s.rowPitch / 2 + 0.5
        })

    ;(function renderAlphanumericsAndFlag(root) {

        bind(root, 'nameCell')
            .entered
            .classed('namesGroup', true)
        bind(root['nameCell'], 'nameCellText', 'text')
            .entered
            .text(key)
            .attr({
                y: '0.5em'
            })
            .attr({
                'transform': translateX(0)
            })
    })(row)

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
