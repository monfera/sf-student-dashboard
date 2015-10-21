/**
 * D3 utilities
 *
 * Copyright Robert Monfera
 */

function tupleSorter(t1, t2) {
    var a = t1[0], b = t2[0]
    return a < b ? -1 : a > b ? 1 : 0
}

function last(a) {
    return a[a.length - 1]
}

function add(x, y) {
    return x + y
}

function constant(value) {
    return function() {
        return value
    }
}

function identity(x) {
    return x
}

function compose(fun1, fun2) {
    if(arguments.length === 2) {
        return function (/*args*/) {
            return fun1(fun2.apply(null, arguments))
        }
    } else {
        var functions = Array.prototype.slice.call(arguments)
        var len = functions.length
        return function(/*args*/) {
            var value = (functions[len - 1]).apply(null, arguments)
            var i
            for(i = Math.max(0, len - 2); i >= 0; i--) {
                value = (functions[i]).call(null, value)
            }
            return value
        }
    }
}

function property(key) {
    return function(thing) {
        return thing[key]
    }
}

function pluck(key) {
    return function(array) {
        var i
        var result = []
        for(i = 0; i < array.length; i++) {
            result.push(array[i][key])
        }
        return result
    }
}

function object(keyValuePairs) {
    var result = {}
    var i
    for(i = 0; i < keyValuePairs.length; i++) {
        result[keyValuePairs[i][0]] = keyValuePairs[i][1]
    }
    return result
}

function pairs(object) {
    var keys = Object.keys(object)
    var result = []
    var key
    var i
    for(i = 0; i < keys.length; i++) {
        key = keys[i]
        result.push([key, object[key]])
    }
    return result
}

function findWhere(key, value) {
    // works for objects now...
    return function(obj) {
        var keys = Object.keys(obj)
        var i
        for(i = 0; i < keys.length; i++) {
            if(obj[[keys[i]]][key] === value) {
                return obj[keys[i]]
            }
        }
        return void(0)
    }
}

function sortBy(obj, comparisonAccessor) {
    // stable sort inspired by the underscore.js implementation
    return obj.map(function(element, index) {
        return {
            value: element,
            index: index,
            comparedValue: comparisonAccessor(element)
        }
    }).sort(function(left, right) {
        var a = left.comparedValue
        var b = right.comparedValue
        return a < b ? -1 : a > b ? 1 : left.index - right.index
    }).map(function(obj) {return obj.value})
};

function countBy(array, accessorFunction) {
    var accessor = accessorFunction || identity
    var result = {}
    var value
    var i
    for(i = 0; i < array.length; i++) {
        value = accessor(array[i])
        if(result[value]) {
            result[value]++
        } else {
            result[value] = 1
        }
    }
    return result
}

function always() {
    return true
}

function key(obj) {
    return obj.key
}

function value(obj) {
    return obj.value
}

function window2(a) {
    return a.map(function(value, index, array) {
        return [value, array[index + 1]]
    }).slice(0, a.length - 1)
}

function tuple(/*args*/) {
    var functions = Array.prototype.slice.call(arguments)
    return function (x) {
        return functions.map(function (elem, i, funs) {
            return funs[i](x)
        })
    }
}

function clamp(base, array) {
    var min = base[0]
    var max = base[1]
    var result = array.map(function(d) {return Math.min(max, Math.max(min, d))})
    return result
}

function bind0(rootSelection, cssClass, element, dataFlow) {
    cssClass = cssClass || 'boundingBox'
    element = element || 'g'
    dataFlow = typeof dataFlow === 'function' ? dataFlow : (dataFlow === void(0) ? du.repeat : constant(dataFlow))
    var classesToClassAttr = function (classNames) {
            return classNames.join(' ')
        },
        classesToCssSelector = function (classNames) {
            return (['']).concat(classNames).join(' .')
        },
        cssClasses = classesToCssSelector([cssClass]),
        binding = rootSelection.selectAll(cssClasses).data(dataFlow, key)

    binding.entered = binding.enter().append(element)
    binding.entered.attr('class', classesToClassAttr([cssClass]))

    return binding
}

function bind(object, key) {
    var result = bind0.apply(null, arguments)
    object[key] = result
    return result
}

function bindd() {
    var result = bind.apply(null, arguments)
    du.pointMarker(result, [{key: 0}])
    return result
}

function translate(funX, funY) {
    return function (d, i) {
        return 'translate(' + (typeof funX === 'function' ? funX(d, i) : funX) + ',' + (typeof funY === 'function' ? funY(d, i) : funY) + ')';
    }
}

function translateX(funX) {
    return function (d, i) {
        return 'translate(' + (typeof funX === 'function' ? funX(d, i) : funX) + ', 0)'
    }
}

function translateY(funY) {
    return function (d, i) {
        return 'translate(0, ' + (typeof funY === 'function' ? funY(d, i) : funY) + ')'
    }
}

var du = {

    repeat: tuple(identity),
    descend: identity,
    bind: bind,
    pointMarker: function(selection, data) {
        selection.each(function(d) {
            var c = bind0(selection, 'point-marker-c', 'circle', data)
            c.entered.attr({r: '10px', fill: 'red', 'opacity': 0.2})
            c.exit().remove()

            var h = bind0(selection, 'point-marker-h', 'line', data)
            h.entered.attr({x1: -10000, x2: 10000, 'stroke-dasharray': '2 4', stroke: 'red', 'opacity': 0.5})
            h.exit().remove()

            var v = bind0(selection, 'point-marker-v', 'line', data)
            v.entered.attr({y1: -10000, y2: 10000, 'stroke-dasharray': '2 4', stroke: 'red', 'opacity': 0.5})
            v.exit().remove()
        })
    }
}