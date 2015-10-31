/**
 *  Bandline renderer
 *
 * Implementation of Stephen Few's bandlines
 *
 * Copyright Robert Monfera
 * Design: Stephen Few
 * Design documentation: https://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf
 */

function defined(x) {
    return !isNaN(x) && isFinite(x) && x !== null
}

function rectanglePath(xr, yr) {
    return d3.svg.line()([[xr[0], yr[0]], [xr[1], yr[0]], [xr[1], yr[1]], [xr[0], yr[1]]]) + 'Z'
}

function bandLinePath(valueAccessor, xScale, yScaler, d) {
    var drawer = d3.svg.line().defined(compose(defined, property(1)))
    return drawer(valueAccessor(d).map(function(s, i) {return [xScale(i), yScaler(d)(s)]}))
}

function bandData(bands, yScaler, d) {
    var yScale = yScaler(d)
    return bands.map(function(band, i) {
        return {key: i, value: band, yScale: yScale}
    })
}

function renderBands(root, bands, yScaler, xRanger, yRanger) {
    bind(bind(root, 'bands'), 'band', 'path', bandData.bind(0, bands, yScaler))
        .transition()
        .attr('class', function(d, i) {return 'band s' + i})
        .attr('d', function(d) {return rectanglePath(xRanger(d), yRanger(d))})
}

function pointData(valueAccessor, d) {
    return valueAccessor(d).map(function(value, i) {return {key: i, value: value, dd: d}}).filter(compose(defined, value))
}

function renderPoints(root, valueAccessor, pointStyleAccessor, rScale, xSpec, ySpec) {
    bind(root, 'valuePoints', 'g', pointData.bind(0, valueAccessor))
        .entered
        .attr('transform', translate(xSpec, ySpec))
    root['valuePoints']
        .transition()
        .attr('transform', translate(xSpec, ySpec))
    bind(root['valuePoints'], 'point', 'circle')
        .attr('class', function(d) {return 'point ' + pointStyleAccessor(d.value)})
        .transition()
        .attr('r', function(d) {return rScale(pointStyleAccessor(d.value))})
    root['valuePoints'].exit().remove()
}

function valuesExtent(valueAccessor, d) {
    return d3.extent(valueAccessor(d).filter(defined))
}

function sparkStripBoxPath(valueAccessor, xScale, yRange, d) {
    var midY = d3.mean(yRange)
    var halfHeight = (yRange[1] - yRange[0]) / 2
    return rectanglePath(
        valuesExtent(valueAccessor, d).map(xScale),
        [midY - halfHeight / 2, midY + halfHeight / 2]
    )
}

function renderExtent(root, valueAccessor, xScale, yRange) {
    bind(root, 'valueBox', 'path')
        .transition()
        .attr('d', sparkStripBoxPath.bind(0, valueAccessor, xScale, yRange))
}

function renderValueLine(root, valueAccessor, xScale, yScaler) {
    bind(root, 'valueLine', 'path')
        .transition()
        .attr('d', bandLinePath.bind(0, valueAccessor, xScale, yScaler))
}

function bandLine() {
    function renderBandLine(root) {

        var bandLine = bind(root, 'bandLine')
        renderBands(bandLine, _bands, _yScalerOfBandLine, constant(_xScaleOfBandLine.range()), function (d) {
            return d.value.map(d.yScale)
        })
        renderValueLine(bandLine, _valueAccessor, _xScaleOfBandLine, _yScalerOfBandLine)
        renderPoints(bandLine, _valueAccessor, _pointStyleAccessor, _rScaleOfBandLine, compose(_xScaleOfBandLine, key), function (d) {
            return _yScalerOfBandLine(d.dd)(d.value)
        })
    }

    function renderSparkStrip(root) {

        var sparkStrip = bind(root, 'sparkStrip')
        renderBands(sparkStrip, _bands, _yScalerOfSparkStrip, function (d) {
            return d.value.map(_xScaleOfSparkStrip)
        }, constant(_yRange))
        renderExtent(sparkStrip, _valueAccessor, _xScaleOfSparkStrip, _yRange)
        renderPoints(sparkStrip, _valueAccessor, _pointStyleAccessor,  _rScaleOfSparkStrip, compose(_xScaleOfSparkStrip, value), _yScalerOfSparkStrip())
    }

    function yScalerOfBandLineCalc() {
        return function (d) {
            return d3.scale.linear().domain(valuesExtent(_valueAccessor, d)).range(_yRange).clamp(true)
        }
    }

    var _bands = [[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1]]
    var bands = function(spec) {
        if(spec !== void(0)) {
            _bands = spec
            return obj
        } else {
            return bands
        }
    }

    var _valueAccessor = value
    var valueAccessor = function(spec) {
        if(spec !== void(0)) {
            _valueAccessor = spec
            _yScalerOfBandLine = yScalerOfBandLineCalc()
            return obj
        } else {
            return _valueAccessor
        }
    }

    var _xScaleOfBandLine = d3.scale.linear()
    var xScaleOfBandLine = function(spec) {
        if(spec !== void(0)) {
            _xScaleOfBandLine = spec
            return obj
        } else {
            return _xScaleOfBandLine
        }
    }

    var _xScaleOfSparkStrip = d3.scale.linear()
    var xScaleOfSparkStrip = function(spec) {
        if(spec !== void(0)) {
            _xScaleOfSparkStrip = spec
            return obj
        } else {
            return _xScaleOfSparkStrip
        }
    }

    var _rScaleOfBandLine = constant(2)
    var rScaleOfBandLine = function(spec) {
        if(spec !== void(0)) {
            _rScaleOfBandLine = spec
            return obj
        } else {
            return _rScaleOfBandLine
        }
    }

    var _rScaleOfSparkStrip = constant(2)
    var rScaleOfSparkStrip = function(spec) {
        if(spec !== void(0)) {
            _rScaleOfSparkStrip = spec
            return obj
        } else {
            return _rScaleOfSparkStrip
        }
    }

    var _yRange = [0, 1]
    var _yScalerOfSparkStrip
    var _yScalerOfBandLine
    var yRange = function(spec) {
        if(spec !== void(0)) {
            _yRange = spec
            _yScalerOfSparkStrip = constant(d3.mean(_yRange))
            _yScalerOfBandLine = yScalerOfBandLineCalc()
            return obj
        } else {
            return _yRange
        }
    }

    var _pointStyleAccessor = constant('normal')
    var pointStyleAccessor = function(spec) {
        if(spec !== void(0)) {
            _pointStyleAccessor = spec
            return obj
        } else {
            return _pointStyleAccessor
        }
    }

    var obj = {
        renderBandLine: renderBandLine,
        renderSparkStrip: renderSparkStrip,
        bands: bands,
        valueAccessor: valueAccessor,
        xScaleOfBandLine: xScaleOfBandLine,
        xScaleOfSparkStrip: xScaleOfSparkStrip,
        rScaleOfBandLine: rScaleOfBandLine,
        rScaleOfSparkStrip: rScaleOfSparkStrip,
        yRange: yRange,
        pointStyleAccessor: pointStyleAccessor
    }

    return obj
}