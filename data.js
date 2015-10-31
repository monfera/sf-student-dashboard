function sample() {

    // Sampling from a  normal distribution raised to a power for frequent generation of outliers
    var tserLength = 8
    var range = Array.apply(Array, Array(tserLength))
    var tsers = ['Insulin-like growth factor', 'Von Willebrand Factor', 'Voltage-gated 6T & 1P', 'Mechanosensitive ion ch.',
                 'GABAA receptor positive ', 'Epidermal growth factor', 'Signal recognition particle'].map(function (d) {
        return {
            key: d,
            value: range.map(function () {
                return (Math.random() > 0.5 ? 1 : -1) * Math.pow(Math.abs(Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3, 1.3)
            })
        }
    })
    return tsers
}