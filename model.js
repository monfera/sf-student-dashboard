function setupBandline(tsers) {

    var allValuesSorted = [].concat.apply([], tsers.map(value)).sort(d3.ascending)
    var bandThresholds = [d3.min(allValuesSorted), d3.quantile(allValuesSorted, 0.25), d3.quantile(allValuesSorted, 0.75), d3.max(allValuesSorted)]

    var outlierClassifications = ['lowOutlier', 'normal', 'highOutlier']

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
        // The median line is approximated as a band of 0 extent (CSS styling is via 'stroke').
        // This 'band' is to be tacked on last so it isn't occluded by other bands (SVG uses the painter's algo for Z)
        var median = d3.median(sortedValues)
        return [median, median]
    }

    // Setting up the bandLine with the domain dependent values only (FP curry style applied on 'functional objects')
    // This helps decouple the Model and the viewModel (MVC-like principle)
    return bandLine()
        .bands(window2(bandThresholds).concat([medianLineBand(allValuesSorted)]))
        .valueAccessor(property('value'))
        .pointStyleAccessor(makeOutlierScale(allValuesSorted))
        .xScaleOfBandLine(d3.scale.linear().domain([0, d3.max(tsers.map(compose(property('length'), property('value')))) - 1]))
        .xScaleOfSparkStrip(d3.scale.linear().domain(d3.extent(bandThresholds)))
        .rScaleOfBandLine(d3.scale.ordinal().domain(outlierClassifications))
}
