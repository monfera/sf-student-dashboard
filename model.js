/**
 * Dashboard model - data reshaping, variables, scales and configuration
 *
 * Copyright Robert Monfera
 */

var dashboardVariables = {
    name: {
        key: 'Name',
        plucker: key
    },
    meanAssignmentScore: {
        key: 'Assignments',
        plucker: function(student) {return d3.mean(student.assignmentScores.filter(identity))}
    },
    assignmentSpread: {
        key: 'Spread',
        plucker: function(student) {return d3.deviation(student.assignmentScores.filter(identity))}
    },
    pastYearsMeanAssignmentScore: {
        key: 'Assessments',
        plucker: function(student) {return d3.mean(student.standardScores)}
    }
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

/**
 * Scales
 */

function calculateScales() {

    var s = {}

    s.rowPitch = 28
    s.rowBandRange = s.rowPitch / 1.3

    var bandThresholds = [0.4, 0.6, 0.7, 0.8, 0.9, 1]

    function sortedNumbers(population) {
        return population.filter(defined).sort(d3.ascending)
    }

    var outlierClassifications = ['lowOutlier', 'normal', 'highOutlier']
    var outlierClassificationIndex = function(classification) {
        return outlierClassifications.indexOf(classification)
    }

    function makeOutlierScale(population) {
        var iqrDistanceMultiplier = 1 // Stephen Few's Introduction of Bandlines requires a multiplier of 1.5; we deviate here to show outliers on the dashboard
        var values = sortedNumbers(population)
        var iqr = [d3.quantile(values, 0.25), d3.quantile(values, 0.75)]
        var midspread = iqr[1] - iqr[0]
        return d3.scale.threshold()
            .domain([
                iqr[0] - iqrDistanceMultiplier * midspread,
                iqr[1] + iqrDistanceMultiplier * midspread ])
            .range(outlierClassifications)
    }

    function medianLineBand(population) {
        var median = d3.median(population)
        return [median, median]
    }

    var assignmentScores = [].concat.apply([], dashboardData['Student Data'].map(property('assignmentScores')))
    var assessmentScores = [].concat.apply([], dashboardData['Student Data'].map(property('standardScores')))

    s.assignmentOutlierScale = makeOutlierScale(assignmentScores)
    s.assessmentOutlierScale = makeOutlierScale(assessmentScores)

    s.assignmentBands = window2(bandThresholds).concat([medianLineBand(assignmentScores)])
    s.assessmentBands = window2(bandThresholds).concat([medianLineBand(assessmentScores)])

    s.bandLinePointRScale = function(classification) {
        return [2.5, 1.5, 3][outlierClassificationIndex(classification)]
    }
    s.sparkStripPointRScale = function(classification) {
        return 2 // r = 2 on the spark strip irrespective of possible outlier status
    }

    var assignmentScoreVerticalDomain = d3.extent(bandThresholds) // fixme adapt the scale for the actual score domain

    var assignmentScoreCount = 7 //  5 past assignments and 2 future assignments

    var assignmentScoreDomain = [0, assignmentScoreCount - 1]

    s.assignmentScoreTemporalScale = d3.scale.linear()
        .domain(assignmentScoreDomain) // fixme adapt the scale for the actual number of scores
        .range([2, 74])

    s.assignmentScoreTemporalScale2 = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range([2, 50])

    s.assessmentScoreTemporalScale = d3.scale.linear()
        .domain([0, 4]) // fixme adapt the scale for the actual number of scores
        .range([0, 58])

    var scoreRange = [s.rowBandRange / 2 , -s.rowBandRange  / 2]

    s.assessmentScoreScale = d3.scale.linear()
        .domain([0.5, 1]) // fixme adapt the scale for the actual score domain
        .range(scoreRange)

    s.assignmentScoreVerticalScale = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range(scoreRange)

    s.assignmentScoreVerticalScaleLarge = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range([s.rowBandRange * 2 , -s.rowBandRange])

    s.assignmentScoreHorizontalScale = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range([0, 98])

    s.scoreBandScale = d3.scale.ordinal()
        .domain(d3.range(6))
        .rangePoints([0, 100], 1)

    return s
}