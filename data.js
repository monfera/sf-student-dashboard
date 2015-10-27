/**
 * Student performance data
 *
 * Data for Stephen Few's Student Performance Dashboard
 *
 * Used with permission from Stephen Few
 */

var tserLength = 10

var range = Array.apply(Array, Array(tserLength))

var tsers = ['A', 'B', 'C', 'D'].map(function(d) {
    return {
        key: 'Gaussian Time Series ' + d,
        value: range.map(function() {
            return (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) / 6 - 0.5
        })
    }
})
