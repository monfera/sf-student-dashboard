function setupBandline(tsers) {
    var allValuesSorted = [].concat.apply([], tsers.map(value)).sort(d3.ascending)
    var bandThresholds = [d3.min(allValuesSorted), d3.quantile(allValuesSorted, 0.25), d3.quantile(allValuesSorted, 0.75), d3.max(allValuesSorted)]

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
                iqr[1] + iqrDistanceMultiplier * midspread
            ])
            .range(outlierClassifications)
    }

    function medianLineBand(sortedValues) {
        var median = d3.median(sortedValues)
        return [median, median]
    }

    return bandLine()
        .bands(window2(bandThresholds).concat([medianLineBand(allValuesSorted)]))
        .valueAccessor(property('value'))
        .pointStyleAccessor(makeOutlierScale(allValuesSorted))
        .xScaleOfBandLine(d3.scale.linear().domain([0, d3.max(tsers.map(compose(property('length'), property('value')))) - 1]).range([0, 100]))
        .xScaleOfSparkStrip(d3.scale.linear().domain(d3.extent(bandThresholds)).range([2, 50]))
        .rScaleOfBandLine(function(classification) {return [2, 0, 2][outlierClassificationIndex(classification)]})
        .rScaleOfSparkStrip(function() {return 2})
        .yRange([rowBandRange / 2 , -rowBandRange  / 2])
}