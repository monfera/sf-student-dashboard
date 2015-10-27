/**
 * Dashboard model - data reshaping, variables, scales and configuration
 *
 * Copyright Robert Monfera
 */

var allValuesSorted = [].concat.apply([], tsers.map(value)).sort(d3.ascending)
var bandThresholds = [d3.min(allValuesSorted), d3.quantile(allValuesSorted, 0.25), d3.quantile(allValuesSorted, 0.75), d3.max(allValuesSorted)]

var rowPitch = 40
var rowBandRange = rowPitch / 1.3

var outlierClassifications = ['lowOutlier', 'normal', 'highOutlier']
var outlierClassificationIndex = function(classification) {
    return outlierClassifications.indexOf(classification)
}

function makeOutlierScale(sortedValues) {
    var iqrDistanceMultiplier = 1.5 // As per Stephen Few's specification
    var iqr = [d3.quantile(sortedValues, 0.25), d3.quantile(sortedValues, 0.75)]
    var midspread = iqr[1] - iqr[0]
    return d3.scale.threshold()
        .domain([
            iqr[0] - iqrDistanceMultiplier * midspread,
            iqr[1] + iqrDistanceMultiplier * midspread ])
        .range(outlierClassifications)
}

function medianLineBand(sortedValues) {
    var median = d3.median(sortedValues)
    return [median, median]
}

var outlierScale = makeOutlierScale(allValuesSorted)

var bands = window2(bandThresholds).concat([medianLineBand(allValuesSorted)])

var bandLinePointRScale = function(classification) {
    return [2, 1, 2][outlierClassificationIndex(classification)]
}
var sparkStripPointRScale = function(classification) {
    return 2 // r = 2 on the spark strip irrespective of possible outlier status
}

var valueVerticalDomain = d3.extent(bandThresholds) // fixme adapt the scale for the actual score domain

var valueCount = d3.max(tsers.map(compose(property('length'), property('value'))))

var valueDomain = [0, valueCount - 1]

var temporalScale = d3.scale.linear()
    .domain(valueDomain) // fixme adapt the scale for the actual number of scores
    .range([0, 100])

var horizontalValueScale = d3.scale.linear()
    .domain(valueVerticalDomain)
    .range([2, 100 / 1.614])

var valueRange = [rowBandRange / 2 , -rowBandRange  / 2]
