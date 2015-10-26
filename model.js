/**
 * Dashboard model - data reshaping, variables, scales and configuration
 *
 * Copyright Robert Monfera
 */

rowPitch = 28
rowBandRange = rowPitch / 1.3

var bandThresholds = [0.4, 0.6, 0.7, 0.8, 0.9, 1]

function sortedNumbers(population) {
    return population.slice().sort(d3.ascending)
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

var values = [].concat.apply([], members.map(value))

var outlierScale = makeOutlierScale(values)

var bands = window2(bandThresholds).concat([medianLineBand(values)])

var bandLinePointRScale = function(classification) {
    return [2.5, 1.5, 3][outlierClassificationIndex(classification)]
}
var sparkStripPointRScale = function(classification) {
    return 2 // r = 2 on the spark strip irrespective of possible outlier status
}

var assignmentScoreVerticalDomain = d3.extent(bandThresholds) // fixme adapt the scale for the actual score domain

var assignmentScoreCount = 7 //  5 past assignments and 2 future assignments

var assignmentScoreDomain = [0, assignmentScoreCount - 1]

var assignmentScoreTemporalScale = d3.scale.linear()
    .domain(assignmentScoreDomain) // fixme adapt the scale for the actual number of scores
    .range([2, 74])

var assignmentScoreTemporalScale2 = d3.scale.linear()
    .domain(assignmentScoreVerticalDomain)
    .range([2, 50])

var scoreRange = [rowBandRange / 2 , -rowBandRange  / 2]

var assignmentScoreVerticalScale = d3.scale.linear()
    .domain(assignmentScoreVerticalDomain)
    .range(scoreRange)
