export function createEVCarSalesVis() {

    const layout_padding = { top: 100, right: 40, bottom: 30, left: 80 },
    chartW = 1000 - layout_padding.left - layout_padding.right,
    chart_height = window.innerHeight - layout_padding.top - layout_padding.bottom;

    const chart_root = d3.select("#main-vis")
    // .append("svg")
    // .attr("width", chartW + layout_padding.left + layout_padding.right)
    // .attr("height", chart_height + layout_padding.top + layout_padding.bottom)
        .append("g")
        .attr("transform", `translate(${layout_padding.left}, ${layout_padding.top})`);


    // Append chart title
    chart_root.append("text")
        .attr("x", chartW / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#111")
        .text("Number of New Cars Sold by Type per Year");

    // Append subtitle line 1
    chart_root.append("text")
        .attr("x", chartW / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "#666")
        .text("Electric vs. Non-Electric Global Car Sales (2010–2023)");

    // Append subtitle line 2
    chart_root.append("text")
        .attr("x", chartW / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "#777")
        .text("Electric cars include fully battery-electric and plug-in hybrids.");

    d3.csv("data/car-sales.csv").then(car_sales_records => {
    car_sales_records.forEach(entry => {
        entry.Year = +entry.Year;
        entry.ev_total = +entry["Electric cars sold"];
    entry.gas_total = +entry["Non-electric cars sold"];
    });



    console.log("Raw sales data loaded:", car_sales_records);



    const carTypeKeys = ["gas_total", "ev_total"];
    const sales_breakdown = d3.stack()
    .keys(carTypeKeys)
    .value((entry, key)=>entry[key])(car_sales_records);

    const year_axis_scale = d3.scaleBand()
    .domain(car_sales_records.map(d => d.Year))
    .range([0, chartW])
        .padding(0.2);



    const salesScale = d3.scaleLinear()
    .domain([0, 100000000])
    .nice()
    .range([chart_height, 0]);

    chart_root.append("g")
    .attr("class", "grid")
    .call(
        d3.axisLeft(salesScale)
        .tickSize(-chartW)
        .tickFormat("")
    );


    const color_map = d3.scaleOrdinal()
    .domain(carTypeKeys)
    .range(["#E29578", "#4682B4"]);

    
    chart_root.append("g")
        .attr("transform", `translate(0, ${chart_height})`)
    .call(d3.axisBottom(year_axis_scale)
        .tickFormat(d3.format("d")));

    chart_root.append("g")
    .call(
        d3.axisLeft(salesScale)
        .ticks(5)
        .tickFormat(val => val === 0 ? "0 cars" : `${val / 1e6} million cars`)
    );

    // const info_box = d3.select("#tooltip");
    let info_box = d3.select("#tooltip_vis3");
    if (info_box.empty()) {
        info_box = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr('id', 'tooltip_vis3')
            .style("opacity", 0);
}

    // render stacked bars with hover behavior
    const barGroups = chart_root.selectAll(".layer")
    .data(sales_breakdown)
    .enter()
    .append("g")
        .attr("fill", d => color_map(d.key));





    const bars = barGroups
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect");

    bars.attr("class", d => `bar year-${d.data.Year}`)
    .attr("x",   d => year_axis_scale(d.data.Year))
        .attr("y", d => salesScale(d[1]))
        .attr("height", d => salesScale(d[0]) - salesScale(d[1]))
    .attr("width",year_axis_scale.bandwidth())

    .on("mouseover", function(event,d){
        const yr = d.data.Year;
        const ev = d.data.ev_total;
        const gas = d.data.gas_total;
        const total_sales = ev + gas;

        d3.selectAll(`.year-${yr}`).style("opacity", 0.7);
        // console.log(`[hover] ${yr} | EV: ${ev} | Gas: ${gas} | Total: ${total_sales}`);

        const format_number = val =>
            val >= 1000000 ? (val / 1000000).toFixed(2) + " million"
                            : val.toLocaleString();

        info_box.html(`
            <strong>${yr}</strong>
            <div>Electric cars: ${format_number(ev)}</div>
            <div>Non-electric cars: ${format_number(gas)}</div>
            <div><b>Total: ${format_number(total_sales)}</b></div>
        `)
        .style("opacity",1)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 40) + "px");
    })

    .on("mousemove", function(event){
        info_box
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 40) + "px");
    })

    .on("mouseout", function(event, d){
        d3.selectAll(`.year-${d.data.Year}`).style("opacity", 1);
            info_box.style("opacity", 0);
    });




    const legend_blocks = chart_root.selectAll(".legend")
        .data(carTypeKeys)
        .enter()
        .append("g")
        .attr("transform", (key, idx) =>
            `translate(${chartW - 150}, ${idx * 25})`);

    legend_blocks.append("rect")
        .attr("x", 0)
    .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => color_map(d));

    legend_blocks.append("text")
    .attr("x",20)
    .attr("y", 12)
    .text(d => d === "ev_total" ? "Electric cars" : "Non-electric cars")
        .attr("font-size", "12px")
    .attr("fill", "#333");

    // legend_blocks.style("pointer-events", "none"); // was going to disable legend hover — might revisit
    });

}