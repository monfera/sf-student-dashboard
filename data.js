function sample() {

    // Sampling from a cubic normal distribution to easily generate outliers
    var tserLength = 8
    var range = Array.apply(Array, Array(tserLength))
    var tsers = ['Insulin-like growth factor', 'Von Willebrand Factor', 'Voltage-gated 6T & 1P', 'Mechanosensitive ion ch.'].map(function (d) {
        return {
            key: d,
            value: range.map(function () {
                return Math.pow((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3, 3)
            })
        }
    })
    return tsers
}