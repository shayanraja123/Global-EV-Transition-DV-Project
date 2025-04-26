let world_data = null

function drawPolarChart() {
    const chart = d3.ez.chart.roseChart()
        .width(750)
        .height(500)
        .colors(["#00C41d", "#FFA500", "#800080", "#FFE714", "#727272"])
    
    const chartHolder = d3.select('#polar-chart')

    chartHolder
        .datum(world_data)
        .call(chart)
    
}
document.addEventListener('DOMContentLoaded', function () {

    d3.csv('dan-data/charging_ports_database.csv').then(function(data) {
        console.log('loaded data')

        // world_data = data.filter(obj => obj.geo_zone === 'World')
        world_data = data.filter(obj => obj.geo_zone === 'World' && obj.year > 2024)
            .filter(obj => obj.scenario_type === 'IEA-APS' || obj.scenario_type=== 'IEA-NZE')


        world_data = world_data.map((obj, i) => ({
            ...obj,
            id: i,
            slow_fast_units: +obj.slow_fast_units.trim().replace(/,/g, ''),
            year: +obj.year
        }))
        
        const grouped = d3.group(world_data, d => d.year)

        world_data = Array.from(grouped, ([key, values]) => ({
            key: String(key),
            values: values.map(d => ({ key: d.scenario_type, value: d.slow_fast_units}))
        }))
        console.log(world_data)

        
        drawPolarChart()
    })

    
})