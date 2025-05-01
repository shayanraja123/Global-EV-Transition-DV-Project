export function createBatteryCostVis() {
    
    const chartMargins = { top: 100, right: 60, bottom: 200, left: 80 },
        chartWidth = 1000 - chartMargins.left - chartMargins.right,
        chartHeight = 800 - chartMargins.top - chartMargins.bottom;

    // Mount the main SVG and group element
    const chartCanvas = d3.select("#main-vis")
        .attr("viewBox", `0 0 ${chartWidth + chartMargins.left + chartMargins.right} ${chartHeight + chartMargins.top + chartMargins.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        // .attr("width", chartWidth + chartMargins.left + chartMargins.right)
        // .attr("height", chartHeight + chartMargins.top + chartMargins.bottom)
        .append("g")
        .attr("transform", `translate(${chartMargins.left},${chartMargins.top})`);

    chartCanvas.append("text")
        .attr("x", (chartWidth + chartMargins.left) / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#111")
        .text("Price of Lithium-ion Batteries Over the Years");
    
    chartCanvas.append("text")
        .attr("x", (chartWidth + chartMargins.left) / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "#555")
        .text("Price of lithium-ion battery cells per kWh (logarithmic axis)");

    try {
    d3.csv("data/battery_cost_data.csv").then(vehicleData => {
        vehicleData.forEach(item => {
        item.Year = +item.Year
        item.Price = +item.Price;
        });

        console.log("Parsed vehicle data:", vehicleData);

        const yearScale = d3.scaleLinear()
        .domain(d3.extent(vehicleData, d => d.Year))
        .nice()
        .range([0, chartWidth]);

        const priceTicks = [100, 200, 500, 1000, 2000, 5000, 10000];

        const price_scale = d3.scaleLog()
        .domain([100, 10000])
        .range([chartHeight, 0])

        chartCanvas.append("g")
        .call(
            d3.axisLeft(price_scale)
            .tickValues(priceTicks)
            .tickFormat(p => `$${p.toLocaleString()}`)
        )
        .selectAll("text")
        .style("font-size", "15px"); 

        // horizontal gridlinesin the bg for easier price comparison
        chartCanvas.append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(priceTicks)
        .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", chartWidth)
            .attr("y1", t => price_scale(t))
            .attr("y2", t => price_scale(t));

        chartCanvas.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(yearScale).tickFormat(d3.format('d')))
        .selectAll("text")
        .style("font-size", "15px"); 

        const roadPath = d3.line()
        .x(d => yearScale(d.Year))
        .y(d => price_scale(d.Price))
        .curve(d3.curveMonotoneX); // smoothen it out

        chartCanvas.append("path")
        .datum(vehicleData)
        .attr("fill", "none")
        .attr("stroke", "#b0b0b0")
        .attr("stroke-width", 8)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", roadPath);

        // rough angle math between 2 adj. points to ensure that cars align w the trend line
        function getDirectionAngle(start, end) {
        const dx = yearScale(end.Year) - yearScale(start.Year);
        const dy = price_scale(end.Price) - price_scale(start.Price);
        return Math.atan2(dy, dx) * (180 / Math.PI);
        }

        const milestoneYears = [1991, 1995, 2000, 2005, 2010, 2015, 2018];
        const featuredCars = vehicleData.filter(d => milestoneYears.includes(d.Year));

        // console.log("filtered cars:", featuredCars);

        // dropping in car icons at key years
        chartCanvas.selectAll(".car")
        .data(featuredCars)
        .enter()
        .append("image")
            .attr("xlink:href", "assets/car.png")
            .attr("width", 70)
            .attr("height", 70)
            .attr("transform", (car, i) => {
            const x = yearScale(car.Year);
            const y = price_scale(car.Price);
            const next = featuredCars[i + 1] || car;
            const angle = i < featuredCars.length - 1
                ? getDirectionAngle(car, next)
                : getDirectionAngle(featuredCars[i - 1], car);

            // console.log("angle?", angle);

            return `translate(${x - 38}, ${y - 38}) rotate(${angle + 90}, 38, 38)`
            })

        const maxPrice = d3.max(featuredCars, d => d.Price)
        const minPrice = d3.min(featuredCars, d => d.Price);

        // displaying price labels and bumping font size if it's the highest or lowest
        chartCanvas.selectAll(".price-label")
        .data(featuredCars)
        .enter()
        .append("text")
            .attr("class", "price-label")
            .attr("x", d => yearScale(d.Year) + 5)
            .attr("y", d => price_scale(d.Price) - 28)
            .attr("text-anchor", "middle")
            .attr("font-size", d =>
            d.Price === maxPrice || d.Price === minPrice ? "22px" : "18px"
            )
            .attr("font-weight", d =>
            d.Price === maxPrice || d.Price === minPrice ? "bold" : "normal"
            )
            .attr("fill", "#000")
            .text(d => `$${Math.round(d.Price).toLocaleString()}`)
    });
    } catch (e) {
    console.error("Something went wrong loading the CSV");
    }

}