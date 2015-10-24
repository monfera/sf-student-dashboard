/**
 * Dashboard renderer
 *
 * Implementation of Stephen Few's Student Performance Dashboard with Mike Bostock's d3.js library
 *
 * Copyright Robert Monfera
 * Copyright on the design of the Student Performance Dashboard: Stephen Few
 */

var duration = 200
var UNICODE_UP_DOWN_ARROW = ['\u2b0d', '\u21d5'][1]
var UNICODE_NO_BREAK_SPACE = '\u00A0'

var palette = {
    lineGray: 'rgb(166, 166, 166)',
    layoutGray: 'rgb(231, 231, 233)',
    magenta: 'rgb(226, 60, 180)',
    gradePalette: [0.06, 0.1, 0.16, 0.22, 0.3]
}

var benchmarkStyleSet = {
    "District": {stroke: 'black', fill: 'black', opacity: 0.3, 'stroke-width': 1},
    "School": {stroke: 'black', fill: 'black', opacity: 0.5, 'stroke-width': 1},
    "Other Classes": {stroke: 'black', fill: 'black', opacity: 0.5, 'stroke-width': 2},
    "This Class": {stroke: palette.magenta, fill: palette.magenta, 'stroke-width': 1.5}
}

function renderImpactfulPoint(root) {
    bind(root, 'impactfulPointAes', 'circle')
        .entered
        .attr({
            r: 3.75,
            fill: palette.magenta,
            stroke: 'black'
        })
}

function renderPointLegendGrayBackground(root) {
    bind(root, 'markerBar', 'rect')
        .entered
        .attr({
            width: 10,
            height: 18,
            x: -5,
            y: -9,
            stroke: 'none',
            fill: 'lightgrey'
        })
}

function complexStyler(styleSet) {
    // fixme generalise the attributes via just iterating over the key
    return function(selection) {
        selection.attr({
            stroke: function(d) {return styleSet[d.key].stroke},
            fill: function(d) {return styleSet[d.key].fill},
            opacity: function(d) {return styleSet[d.key].opacity},
            'stroke-width': function(d) {return styleSet[d.key]['stroke-width']}
        })
    }
}

function benchmarkStyler() {
    return complexStyler(benchmarkStyleSet)
}

var layout, l

function calculateGlobals() {

    layout = {
        mainRectangleTop: 38
    }

    l = {

        mainRectangleLeft: 48,
        mainRectangleWidth: 1260,

        fontFamily: 'Arial, sans-serif',
        basicFontSize: 14,

        titleTextColor: 'rgb(96, 96, 96)',

        mainTitleAnchor: 'beginning',
        mainTitlePosition: [0, -10],
        mainTitleFontSize: 18,
        mainTitleText: 'First Period: Algebra 1',
        mainTitleLetterSpacing: 0,

        mainTitleDecoratorColor: palette.layoutGray,
        mainTitleDecoratorHeight: layout.mainRectangleTop,
        mainTitleDecoratorY: -layout.mainRectangleTop,
        mainTitleDecoratorStrokeWidth: 0,

        groupTitleFontSize: 18
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

    function renderCross(root) {
        bind(root, 'cross', 'path')
            .entered
            .attr({
                stroke: 'black',
                'stroke-width': 0.7,
                d: function () {
                    var xo = s.rowPitch * 0.125
                    var yo = xo * 1.8
                    return [
                        'M', -xo, -yo, 'L', xo, yo,
                        'M', -xo, yo, 'L', xo, -yo
                    ].join(' ')
                }
            })
    }

    function renderMarkerBar(root) {
        bind(root, 'markerBar', 'line')
            .entered
            .attr({
                y1: - s.rowPitch * 0.25,
                y2: s.rowPitch * 0.25,
                stroke: 'white',
                'stroke-width': 2
            })
    }

    function renderMeanLine(root) {
        bind(root, 'mean', 'line')
            .entered
            .attr({
                stroke: 'black'
            })
            .attr({
                y1: -s.rowPitch / 4,
                y2: s.rowPitch  / 4
            })
    }

    function renderGradeHistogram(root, valueAccessor) {

        var xScale = s.histogramGradeScale
        var yScale = null;

        bind(root, 'gradeHistogram', 'g', function(d) {
            var currentGrades = keptStudentData(d).map(valueAccessor)
            var countsPlusOne = countBy(currentGrades.concat(s.gradesDomain))
            var counts = pairs(countsPlusOne).sort(tupleSorter).map(function(t) {return {key: t[0], value: t[1] - 1}}).reverse()
            var domainBase = 0
            yScale = d3.scale.linear().domain([domainBase, counts.reduce(function(prev, next) {return Math.max(prev, next.value)}, 0)]).range(s.histogramStudentCountScale.range())

            return [{key: 0, value: counts}]
        })
            .entered
            .attr('transform', translateX(33))

        bind(root['gradeHistogram'], 'xAxis')
            .entered
            .call(d3.svg.axis().scale(xScale).orient('bottom'))
        bind(root['gradeHistogram'], 'yAxis')
            .transition().duration(duration)
            .call(d3.svg.axis().scale(yScale).orient('left').ticks(3).tickFormat(function(d) {return d === Math.round(d) ? d : ''}))

        // style the axis ticks
        root.selectAll('g.tick text')
            .attr('font-size', 10)

        bind(root['gradeHistogram'], 'bars', 'g', property('value'))
            .entered
            .attr({transform: translateX(function(d) {return xScale(d.key)})})
        bind(root['gradeHistogram'], 'lineAes', 'path')
            .entered
            .attr({
                stroke: palette.magenta,
                'stroke-width': 1.5
            })
        root['gradeHistogram']['lineAes']
            .transition().duration(duration)
            .attr({
                d: function(d) {
                    return d3.svg.line()
                        .x(compose(xScale, key))
                        .y(compose(yScale, value))
                        .defined(always)(d.value)
                }
            })
    }

    var distributionStyleSet = [
        {key: "Grade", renderer: renderImpactfulPoint},
        {key: "Prior", renderer: renderCross},
        {key: "Goal", renderer: renderMarkerBar, backgroundRenderer: renderPointLegendGrayBackground}
    ]

    var lastAssignmentDistributionStyleSet = [
        {key: "Grade", renderer: renderImpactfulPoint},
        {key: "Average", renderer: renderMeanLine}
    ]

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
    dashboard
        .entered
        .attr({
            'font-family': l.fontFamily
        })
        .attr({
            'font-size': l.basicFontSize
        })

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
        .attr({transform: translateX(l.mainRectangleLeft)})


    /**
     * Dashboard title and date
     */

    bind(mainRectangleTopLeft, 'mainRectangleTopBar', 'rect')
        .entered
        .attr({
            width: l.mainRectangleWidth + l.mainRectangleLeft - 24,
            height: l.mainTitleDecoratorHeight,
            x: -l.mainRectangleLeft - 2,
            y: l.mainTitleDecoratorY,
            stroke: l.mainTitleDecoratorColor,
            fill: l.mainTitleDecoratorColor,
            'stroke-width': l.mainTitleDecoratorStrokeWidth
        })

    var topOfRows = 45
    var bottomOfRows = 896
    var bottomOfReport = 986
    var leftOfColumns =  -l.mainRectangleLeft
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
            stroke: palette.layoutGray
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
            stroke: palette.layoutGray
        })

    var mainTitle = bind(mainRectangleTopLeft, 'mainTitle')
    mainTitle
        .entered
        .attr({transform: translate.apply(null, l.mainTitlePosition)})

    bind(mainTitle, 'mainTitleText', 'text')
        .entered
        .text(l.mainTitleText)
        .attr({
            fill: l.titleTextColor,
            'font-size': l.mainTitleFontSize,
            'text-anchor': l.mainTitleAnchor,
            'letter-spacing': l.mainTitleLetterSpacing
        })


    /**
     * Dashboard date
     */

    var dateBlock = bind(mainRectangleTopLeft, 'dateBlock')
    dateBlock
        .entered
        .attr({transform: translate(501, -10)})

    bind(dateBlock, 'dateText', 'text')
        .entered
        .text(('As of ') + 'May 1, 2012' + (UNICODE_NO_BREAK_SPACE + UNICODE_NO_BREAK_SPACE + '(80% complete)'))
        .attr({
            x: 1,
            'font-size': 14,
            fill: l.titleTextColor
        })


    /**
     * Upper right help elements
     */

    var mainRectangleTopRight = bind(mainRectangleTopLeft, 'mainRectangleTopRight', 'g')
    mainRectangleTopRight
        .entered
        .attr({transform: translateX(l.mainRectangleWidth - 18)})

    var helpSet = bind(mainRectangleTopRight, 'helpSet')
        .entered
        .attr({transform: translateY(-18)})

    var noteBlock = bind(helpSet, 'noteBlock')
        .entered
        .attr({transform: translateX(-70 )})

    var helpButtonWidth = 84
    var helpButtonOffsetX = -30
    var helpButtonHeight = 28

    var helpText =
        'Row Sorting:\n' +
        '\u2022 Hover over headers for help text\n' +
        '\u2022 Click and hold header for temporary sorting\n\n' +
        'Row Selections:\n' +
        '\u2022 Click and brush over rows\n' +
        '\u2022 Control/Command key for multiple selections\n\n' +
        '\u00a9 Design: Stephen Few, code: Robert Monfera\n' +
        'Data visualization library: d3.js from M. Bostock'

    var helpButton = bind(noteBlock, 'helpButton')
    helpButton
        .entered
        .attr({transform: translateX(helpButtonOffsetX + helpButtonWidth / 2)})
        .on('click', function() {window.alert(helpText)})

    bind(helpButton, 'helpText', 'title')
        .entered
        .text(helpText)
    bind(helpButton, 'helpButtonRectangle', 'rect')
        .entered
        .attr({
            fill: 'rgb(217, 217, 217)',
            stroke: 'rgb(167, 167, 167)',
            'stroke-width': 2
        })
        .attr({
            x: - helpButtonWidth / 2,
            y: - helpButtonHeight / 2,
            rx: 15,
            ry: 15,
            width: helpButtonWidth,
            height: helpButtonHeight
        })

    bind(helpButton, 'helpButtonText', 'text')
        .entered
        .text('Help')
        .attr({
            x: 0,
            y: '0.35em',
            'text-anchor': 'middle',
            'letter-spacing': 0.5,
            fill: 'rgb(96, 96, 96)'
        })
        .attr({
            'font-size': 14
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
            .attr({
                fill: l.titleTextColor,
                'letter-spacing': 0,
                'font-size': l.groupTitleFontSize,
                opacity: aggregate ? 0 : 1
            })
        bind(header, 'helpText', 'title')
            .entered
            .text(function() {
                var variable = findWhere('headerAlias', text)(dashboardVariables)
                return variable ? variable.helpText : ''
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

    var courseGradesGroupX = 204.5
    var courseGradeBulletOffsetX = 42
    var assignmentScoresGroupX = 408.5
    var topGroupContentsY = 38
    var tserOffsetX = 858
    var behaviorOffsetX = 1140
    var classAttendanceX = tserOffsetX + 300
    var classAssessmentGroupX = 747.5
    var namesGroup = renderGroupHolder(topGroups, 'namesGroup', 'Student', 0, 0, topGroupContentsY)
    var courseGradesGroup = renderGroupHolder(topGroups, 'courseGradesGroup', 'Overall Course Grade' , courseGradesGroupX, 0, topGroupContentsY)
    var classAttendanceGroup = renderGroupHolder(topGroups, 'classAttendanceGroup', 'Attendance', classAttendanceX + (90 - 300), 0, topGroupContentsY)
    var assignmentScoresGroup = renderGroupHolder(topGroups, 'assignmentScoresGroup', 'Assignments', classAssessmentGroupX - 230, 0, topGroupContentsY)
    var assessmentScoresGroup = renderGroupHolder(topGroups, 'assessmentScoresGroup', 'Assessments', classAssessmentGroupX, 0, topGroupContentsY)
    var behaviorGroup = renderGroupHolder(topGroups, 'behaviorGroup', 'Behavior', behaviorOffsetX, 0, topGroupContentsY)

    /**
     * Side header rows
     */

    var aggregateGroupY = 926

    var sideGroups = bind(contents, 'sideGroups')
    sideGroups
        .entered
        .attr('transform', translate(0, aggregateGroupY))

    var distributionsGroup = renderGroupHolder(sideGroups, 'distributionsGroup', 'Grade and Assignment Score Distribution', 204, 0, 0, true)
    var tserGroup = renderGroupHolder(sideGroups, 'tserGroup', 'Attendance Problem Counts', tserOffsetX, 54 - 164, 90, true)
    var benchmarkGroup = renderGroupHolder(sideGroups.entered, 'benchmarkGroup', 'Standardized Math Assessment Score Distribution', 730, -40 - 164, 205, true)
    var medianGroup = renderGroupHolder(sideGroups.entered, 'medianGroup', 'Standardized Math Assessment Median Score', 0, 722, 34, true)
    var behaviorAggregateGroup = renderGroupHolder(sideGroups.entered, 'behaviorAggregateGroup', '', 0, -42, 0, true)
    var assignmentScoresAggregateGroup = renderGroupHolder(sideGroups, 'assignmentScoresAggregateGroup', '', 0, -21, 0, true)


    /**
     * Legends
     */

    var legendRowPitch = 10

    function renderLegend(text, circle) {
        return function renderThisLegend(root) {
            var referenceSize = 8
            if(!circle)
                bind(root, 'legendIcon', 'line')
                    .entered
                    .attr({
                        x2: referenceSize,
                        transform: translateY(-2)
                    })
            bind(root, 'legendText', 'text')
                .text(sortedByThis('legendAlias', text) ? text + ' ' + UNICODE_UP_DOWN_ARROW : text)
                .entered
                .attr({
                    x: referenceSize * 2,
                    y: '0.25em'
                })
            bind(root, 'legendCaptureZone', 'rect')
                .entered
                .attr({
                    x: - referenceSize / 2,
                    y: - legendRowPitch / 2,
                    height: legendRowPitch,
                    width: 100,
                    transform: translateY(-1.5)
                })
                .on('click', setGroupLegendTableSortOrder.bind(0, text))
        }
    }

    function offsetLegends(selection) {selection.entered.attr('transform', translate(2, -130))}
    function offsetLegends_benchmark(selection) {selection.entered.attr('transform', translate(2, 220))}
    function offsetLegends_specialEnglish(selection) {selection.entered.attr('transform', translate(2, aggregateGroupY - 12))}
    function offsetSecondRow(selection) {selection.attr('transform', translateY(legendRowPitch))}
    function offsetSecondColumn_benchmark(selection) {selection.attr('transform', translateX(84))}

    function renderDistributionLegends(root, data) {

        bind(root, 'groupLegends')
            .entered
            .attr('opacity', 1)
        bind(root['groupLegends'], 'legend', 'g', constant(data))
            .entered
            .attr('transform', translate(154, function(d, i) {return i * 20 - 30}))
        bind(root['groupLegends']['legend'], 'legendText', 'text')
            .entered
            .text(key)
        bind(root['groupLegends']['legend'], 'legendBackground')
            .entered
            .attr('transform', translate(-8, -4))
            .each(function(d) {if(d.backgroundRenderer) d.backgroundRenderer(d3.select(this))})
        bind(root['groupLegends']['legend'], 'legendMarker')
            .entered
            .attr('transform', translate(-8, -4))
            .each(function(d) {d.renderer(d3.select(this))})

    }

    renderDistributionLegends(distributionsGroup.legendGroup, distributionStyleSet)

    ;(function namesGroupLegends(group) {

        var root = group.legendGroup

        bind(root, 'groupLegends').call(offsetLegends_specialEnglish)

        bind(root['groupLegends'], 'firstRow')
        bind(root['groupLegends']['firstRow'], 'special').call(renderLegend('S = Special Ed student', true)).entered.classed('firstColumn', true)

        bind(root['groupLegends'], 'secondRow').entered.call(offsetSecondRow)
        bind(root['groupLegends']['secondRow'], 'english').call(renderLegend('E = English language deficiency', true)).entered.classed('firstColumn', true)

    })(namesGroup)

    ;(function assignmentScoreLegends(group) {

        var root = group.legendGroup

        bind(root, 'groupLegends').call(offsetLegends)

        // fixme merge some properties (interactive, helpText) into the variable Model
        renderPetiteHeader(group.group, [
            {key: 'YTD', value: -90, interactive: true},
            {key: 'Spread', value: -21, interactive: true},
            {key: '50%', value: 33, fontSize: 10},
            {key: 'Last', value: 73, interactive: true},
            {key: '100%', value: 125, fontSize: 10},
            {key: 'Late', value: 160, interactive: true}
        ])

    })(assignmentScoresGroup)

    ;(function assessmentLegends(root) {

        renderPetiteHeader(root, [
            {key: 'Last 5', value: 12, interactive: true},
            {key: 'Last ', value: 73, interactive: true}
        ])

    })(assessmentScoresGroup.group)

    ;(function behaviorLegends(root) {

        renderPetiteHeader(root, [
            {key: 'Ref', value: 0, interactive: true},
            {key: 'Det', value: 49, interactive: true}
        ])

    })(behaviorGroup.group)

    ;(function benchmarkLegends(group) {

        var root = group.legendGroup

        bind(root, 'groupLegends').call(offsetLegends_benchmark)

        bind(root['groupLegends'], 'firstRow')
        bind(root['groupLegends']['firstRow'], 'current', 'g', [{key: 'This Class'}]).entered.classed('firstColumn', true).call(renderLegend('This Class')).selectAll('line').call(benchmarkStyler())
        bind(root['groupLegends']['firstRow'], 'school', 'g', [{key: 'School'}]).entered.classed('secondColumn', true).call(offsetSecondColumn_benchmark).call(renderLegend('School')).selectAll('line').call(benchmarkStyler())

        bind(root['groupLegends'], 'secondRow').entered.call(offsetSecondRow)
        bind(root['groupLegends']['secondRow'], 'other', 'g', [{key: 'Other Classes'}]).entered.classed('firstColumn', true).call(renderLegend('Other Classes')).selectAll('line').call(benchmarkStyler())
        bind(root['groupLegends']['secondRow'], 'district', 'g', [{key: 'District'}]).entered.classed('secondColumn', true).call(offsetSecondColumn_benchmark).call(renderLegend('District')).selectAll('line').call(benchmarkStyler())

    })(benchmarkGroup)


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

    function renderBehaviorCounts(root) {
        bind(root, 'refLastFlag')
            .entered
            .attr('transform', translateX(behaviorOffsetX))
        bind(root['refLastFlag'], 'text', 'text')
            .entered
            .text(function (d) {return d.pastReferralCount || ''})
            .attr({
                y: '0.5em',
                'text-anchor': 'end',
                fill: palette.lineGray
            })

        bind(root, 'refCurrentFlag')
            .entered
            .attr('transform', translateX(behaviorOffsetX + 20))
        bind(root['refCurrentFlag'], 'text', 'text')
            .entered
            .text(function (d) {return d.currentReferralCount || ''})
            .attr({
                y: '0.5em',
                'text-anchor': 'end',
                fill: palette.magenta
            })

        bind(root, 'detLastFlag')
            .entered
            .attr('transform', translateX(behaviorOffsetX + 50))
        bind(root['detLastFlag'], 'text', 'text')
            .entered
            .text(function (d) {return d.pastDetentionCount || ''})
            .attr({
                y: '0.5em',
                'text-anchor': 'end',
                fill: palette.lineGray
            })

        bind(root, 'detCurrentFlag')
            .entered
            .attr('transform', translateX(behaviorOffsetX + 70))
        bind(root['detCurrentFlag'], 'text', 'text')
            .entered
            .text(function (d) {return d.currentDetentionCount || ''})
            .attr({
                y: '0.5em',
                'text-anchor': 'end',
                fill: palette.magenta
            })
    }

    ;(function renderAlphanumericsAndFlag(root) {

        bind(root, 'flag')
            .entered
            .classed('flagGroup', true)

        bind(root, 'problemFlag')
            .entered
            .classed('problemFlagGroup', true)
        bind(root['problemFlag'], 'flagAesthetic', 'circle')
            .entered
            .filter(function(d) {return d.problematic})
            .attr({
                fill: 'rgb(29, 174, 236)',
                cy: 1,
                r: 8.5
            }).attr({
                transform: translateX(-20)
            })

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

        bind(root, 'currentCourseGrade')
            .entered
            .classed('currentCourseGradeGroup', true)
            .attr({
                transform: translateX(210.5),
                fill: palette.magenta
            })
        bind(root['currentCourseGrade'], 'currentCourseGradeText', 'text')
            .entered
            .attr({y: '0.5em'})
            .text(function (d) {return d.grades.current})

        bind(root, 'assignmentAverage')
            .entered
            .attr({
                transform: translateX(358.5),
                fill: palette.lineGray
            })
        bind(root['assignmentAverage'], 'assignmentAverageText', 'text')
            .entered
            .attr({y: '0.5em'})
            .text(function(d) {return Math.round(100 * dashboardVariables.meanAssignmentScore.plucker(d))})

        bind(root, 'lateAssignment')
            .entered
            .classed('lateAssignmentGroup', true)
            .attr('transform', translateX(700))
        bind(root['lateAssignment'], 'lateAssignmentText', 'text')
            .entered
            .text(function (d) {return d.assignmentsLateCount || ""})
            .attr({
                y: '0.5em'
            })
            .attr({
                fill: palette.lineGray
            })

        bind(root, 'lastAssignmentScore')
            .entered
            .classed('lastAssignmentScoresGroup', true)
            .attr('transform', translateX(650))

        bind(root, 'lastAssessmentScore')
            .entered
            .attr('transform', translateX(834))
        bind(root['lastAssessmentScore'], 'lastAssessmentScoreText', 'text')
            .entered
            .text(function (d) {return Math.round(100 * last(d.standardScores))})
            .attr({
                y: '0.5em'
            })
            .attr({
                fill: palette.lineGray
            })

        bind(root, 'englishFlag')
            .entered
            .attr('transform', translateX(158))
        bind(root['englishFlag'], 'englishFlagText', 'text')
            .entered
            .text(function (d) {return !d.english ? 'E' : ''})
            .attr({
                y: '0.5em'
            })
            .attr({
                fill: palette.lineGray
            })

        bind(root, 'specialFlag')
            .entered
            .attr('transform', translateX(170))
        bind(root['specialFlag'], 'specialFlagText', 'text')
            .entered
            .text(function (d) {return d.special ? 'S' : ''})
            .attr({
                y: '0.5em'
            })
            .attr({
                fill: palette.lineGray
            })

        renderBehaviorCounts(root)

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
