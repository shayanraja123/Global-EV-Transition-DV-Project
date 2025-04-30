let world_data = null
let nze_data = null
let sps_data = null
let aps_data = null

// open-source resources used: 
// https://gist.github.com/mbostock/6fead6d1378d6df5ae77bb6a719afcb2#file-preview-jpg
// https://d3-graph-gallery.com/graph/circular_barplot_double.html

function drawPolarChart() {
    const margin = {top: 20, right: 20, bottom: 20, left: 200},
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom,
        innerRadius = 100,
        outerRadius = Math.min(width, height) / 2

    const svg = d3.select('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${width/2+margin.left}, ${height/2+margin.top})`)

    const legendData = ['Actual', 'IEA-NZE', 'IEA-SPS', 'IEA-APS']

    const x = d3.scaleBand()
        .domain([...new Set(world_data.map(d => d.year))])
        .range([0, 2 * Math.PI])
    
    const y = d3.scaleRadial()
        .domain([0, d3.max(world_data, d => d.slow_fast_units)])
        .range([innerRadius, outerRadius])

    const z = d3.scaleOrdinal()
        .domain(legendData)
        .range(['#999999', '#76b7b2', '#f28e2b', '#59a14f'])
    
    svg.append('g')
        .selectAll('path')
        .data(nze_data, d => d.id)
        .join(
            enter => enter.append('path')
                .attr('fill', d => d.year < 2025 ? '#999999' : '#76b7b2')
                // .attr('opacity', 0.7)
                .attr('d', d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(d => y(d.slow_fast_units))
                    .startAngle(d => x(d.year)+.1)
                    .endAngle(d => x(d.year) + x.bandwidth()-.1)
                    .padAngle(0.01)
                    .padRadius(innerRadius)),
            update => update,
            exit => exit.remove()
        )
    
    svg.append('g')
        .selectAll('g')
        .data(nze_data, d => d.id)
        .join(
            enter => enter.append('g')
            .attr("text-anchor", d => (x(d.year) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start")
            .attr("transform", d => "rotate(" + ((x(d.year) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.slow_fast_units)+10) + ",0)")
            .append("text")
                .text(d => d.year)
                .attr("transform", d => (x(d.year) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)")
                .style("font-size", "14px")
                .style('font-weight', 700)
                .attr("alignment-baseline", "middle")
        )

    const yTick = svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll('g')
        .data(y.ticks(5).slice(1))
        .join(
            enter => {
                const g = enter.append('g')
                g.append('circle')
                .attr('fill', 'none')
                .attr('stroke', '#000')
                .attr('opacity', 0.15)
                .attr('r', d => y(d))
                g.append('text')
                    .attr('x', 0)
                    .attr('y', d => -y(d))
                    .attr('dy', '0.35em')
                    .attr('opacity', 0.5)
                    .text(d => y.tickFormat(5, 's')(d))
                return g
            },
            update => update,
            exit => exit.remove()
        )

    // add second series
    svg.append('g')
        .selectAll('.second')
        .data(sps_data, d => d.id)
        .join(
            enter => enter.append('path')
                .attr('class', 'second')
                .attr('fill', d => d.year < 2025 ? '#999999' : '#f28e2b')
                .attr('d', d3.arc()
                    .innerRadius(d => innerRadius)
                    .innerRadius(innerRadius)
                    .outerRadius(d => y(d.slow_fast_units))
                    .startAngle(d => x(d.year) + .1)
                    .endAngle(d => x(d.year) + x.bandwidth()-.41)
                    .padAngle(0.01)
                    .padRadius(innerRadius))
        )

    // add another one
    svg.append('g')
        .selectAll('.third')
        .data(aps_data, d => d.id)
        .join(
            enter => enter.append('path')
                .attr('class', 'third')
                .attr('fill', d => d.year < 2025 ? '#999999' : '#59a14f')
                .attr('d', d3.arc()
                    .innerRadius(d => innerRadius)
                    .innerRadius(innerRadius)
                    .outerRadius(d => y(d.slow_fast_units))
                    .startAngle(d => x(d.year) + .4)
                    .endAngle(d => x(d.year) + x.bandwidth()-.1)
                    .padAngle(0.01)
                    .padRadius(innerRadius))
        )
    
    const legend = svg.append('g')
        .selectAll('g')
        .data(legendData, d => d)
        .join(
            enter => {
                const g = enter.append('g')
                g.attr('transform', (d,i) => `translate(-40, ${i * 30 - 50})`)
                g.append('rect')
                    .attr('width', 18)
                    .attr('height',18)
                    .attr('fill', d => z(d))
                g.append('text')
                    .attr('x', 24)
                    .attr('y', 9)
                    .attr('dy', '0.35em')
                    .style('font-weight', 600)
                    .text(d => d)
                return g
            }
        )

    const title = svg.append('g')
        .selectAll('text')
        .data(['Projected Growth of Charging Ports (Slow and Fast Units)'])
        .join(
            enter => enter.append('text')
                .attr('x', -340)
                .attr('y', -350)
                .attr('dy', '0.35em')
                .style('font-weight', 700)
                .style('font-size', '24px')
                .text(d => d)
        )
    

}

export function createPolarChart() {

    d3.csv('data/charging_ports_database.csv').then(function(data) {
        console.log('loaded data')

        // world_data = data.filter(obj => obj.geo_zone === 'World')
        // world_data = data.filter(obj => obj.geo_zone === 'World' && obj.year > 2024)
        //     .filter(obj => obj.scenario_type === 'IEA-APS' || obj.scenario_type=== 'IEA-NZE')
        
        data = data.map((obj, i) => ({
            ...obj,
            id: i,
            slow_fast_units: +obj.slow_fast_units.trim().replace(/,/g, ''),
            year: +obj.year
        }))
        
        world_data = data.filter(obj => obj.geo_zone === 'World' && (obj.year > 2024 || obj.year === 2015 || obj.year === 2020))
        nze_data = world_data.filter(obj => obj.scenario_type === 'REAL' || obj.scenario_type === 'IEA-NZE')
        sps_data = world_data.filter(obj => obj.scenario_type === 'REAL' || obj.scenario_type === 'IEA-SPS')
        aps_data = world_data.filter(obj => obj.scenario_type === 'REAL' || obj.scenario_type === 'IEA-APS')
        
        // const grouped = d3.group(world_data, d => d.year)

        // world_data = Array.from(grouped, ([key, values]) => ({
        //     key: String(key),
        //     values: values.map(d => ({ key: d.scenario_type, value: d.slow_fast_units}))
        // }))
        // console.log(world_data)
        drawPolarChart()
    })

        
}