var margin = {top: 5, right: 40, bottom: 20, left: 120},
    width = 960 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

var rowPitch = 40
var rowBandRange = rowPitch / 1.3

function sampleAndRender() {
    var tsers = sample()
    render(setupBandline(tsers), tsers)
}

function render(curriedBandLine, tsers) {

    // Column widths
    var nameColumnWidth = 160
    var bandLineWidth = 100
    var sparkStripWidth = 50
    var columnSeparation = 10


    // The bandline gets augmented with the View specific settings (screen widths etc.)
    var bandLine = curriedBandLine //.copy()

    // Augment partially set up elements
    bandLine.xScaleOfBandLine().range([0, bandLineWidth])
    bandLine.xScaleOfSparkStrip().range([0, sparkStripWidth])
    bandLine.rScaleOfBandLine().range([2, 0, 2])

    // Add new elements
    bandLine
        .rScaleOfSparkStrip(constant(2))
        .yRange([rowBandRange / 2 , -rowBandRange  / 2])

    /**
     * Root
     */

    var svg = d3.selectAll('svg')

    svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var dashboard = bind(svg, 'dashboard', 'g', [{key: 0}])

    /**
     * Column headers
     */


    /**
     * Update button
     */

    d3.selectAll("button").on("click", sampleAndRender);

    /**
     * Headers
     */

    bind(dashboard, 'header', 'text', [{key: 'Name'}, {key: 'Time Series'}, {key: 'Spread'}])
        .entered
        .text(key)
        .attr('transform', translate(function(d, i) {return [0, nameColumnWidth + columnSeparation, nameColumnWidth + columnSeparation + bandLineWidth + columnSeparation][i]}, rowPitch))


    /**
     * Rows
     */

    var row = bind(dashboard, 'row', 'g', tsers)

    row.attr('transform', function rowTransform(d, i) {return translateY((i + 2) * rowPitch)()})

    bind(row, 'nameCellText', 'text')
        .text(key)
        .attr('y', '0.5em')

    bind(row, 'assignmentScoresCell')
        .attr('transform', translateX(nameColumnWidth + columnSeparation))
        .call(bandLine.renderBandLine)

    bind(row, 'assignmentScoresVerticalCell')
        .attr('transform', translateX(nameColumnWidth + columnSeparation + bandLineWidth + columnSeparation))
        .call(bandLine.renderSparkStrip)
}