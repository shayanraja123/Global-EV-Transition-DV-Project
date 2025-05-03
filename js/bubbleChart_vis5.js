export function createEVIncentiveBubbleChart() {
    let data = null;
  
    function categorizeIncentiveStrength(incentive) {
      if (incentive < 7500) return 1;
      else if (incentive <= 11500) return 2;
      else if (incentive <= 15500) return 3;
      else return 4;
    }
  
    function drawBubbleChart() {
    //   const margin = { top: 140, bottom: 60, left: 100, right: 100 };
      const margin = { top: 200, bottom: 100, left: 100, right: 100 };
      const width = 1000 - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;
  
      const svg = d3.select("#main-vis");
      svg.selectAll("*").remove(); // clean slate
  
      const chartGroup = svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', null)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
      chartGroup
        .append("text")
        .attr("x", width / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .text("Comparison of EV Incentives Worldwide")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#111");
  
      // Tooltip setup (safe re-init)
      let tooltip = d3.select("#tooltip_vis5");
      if (tooltip.empty()) {
        tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .attr("id", "tooltip_vis5")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("border", "1px solid #ccc")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("opacity", 0);
      }
  
      const [xMin, xMax] = d3.extent(data, (d) => d.Avg_EV_Incentive);
      const [yMin, yMax] = d3.extent(data, (d) => d.Avg_EV_Sales);
  
      const x = d3.scaleLinear().domain([0, xMax]).range([0, width]);
      chartGroup
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        // .selectAll("text")
        // .style("font-size", "15px"); 
  
      const y = d3.scaleLinear().domain([0, yMax]).range([height, 0]);
      chartGroup
        .append("g")
        .call(d3.axisLeft(y))
        // .selectAll("text")
        // .style("font-size", "15px");
  
      const z = d3.scaleOrdinal().domain([1, 2, 3, 4]).range([6, 15, 25, 40]);
  
      const colorScheme = d3
        .scaleOrdinal()
        .domain(Array.from(new Set(data.map((obj) => obj.EV_Incentive_Type))))
        .range(d3.schemeObservable10);
  
      // Draw bubbles
      chartGroup
        .selectAll("circle")
        .data(data, (d) => d.id)
        .join("circle")
        .attr("cx", (d) => x(d.Avg_EV_Incentive))
        .attr("cy", (d) => y(d.Avg_EV_Sales))
        .attr("r", (d) => z(categorizeIncentiveStrength(d.Avg_EV_Incentive)))
        .style("fill", (d) => colorScheme(d.EV_Incentive_Type))
        .style("opacity", "0.7")
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.Country}</strong><br/>
               Incentive: $${d.Avg_EV_Incentive.toLocaleString()}<br/>
               EV Sales: ${d.Avg_EV_Sales.toLocaleString()}<br/>
               Incentive Type: ${d.EV_Incentive_Type}`
            )
            .style("left", (event.pageX < 1000 ? event.pageX + 10 : event.pageX - 250) + "px")
            .style("top", event.pageY - 60 + "px");
            console.log(event.pageX, event.pageY, typeof event.pageX)
  
          d3.select(this).style("stroke", "#333").style("opacity", 1);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", (event.pageX < 1000 ? event.pageX + 10 : event.pageX - 250) + "px")
            .style("top", event.pageY - 60 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this).style("stroke", "white").style("opacity", 0.7);
        });
  
      // Axis labels
      chartGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Average EV Incentive (USD)")
        .attr("font-size", "15px")
        .attr("fill", "#333");
  
      chartGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(-60, ${height / 2}) rotate(-90)`)
        .text("Average EV Sales")
        .attr("font-size", "15px")
        .attr("fill", "#333");
  
      // Color legend
      const legend_color = chartGroup
        .append("g")
        .attr("transform", `translate(${width - 150}, 0)`);
  
      const categories = colorScheme.domain();
      legend_color
        .selectAll("circle")
        .data(categories)
        .enter()
        .append("circle")
        .attr("cx", 60)
        .attr("cy", (d, i) => i * 25)
        .attr("r", 7)
        .style("fill", (d) => colorScheme(d));
  
      legend_color
        .selectAll("text")
        .data(categories)
        .enter()
        .append("text")
        .attr("x", 75)
        .attr("y", (d, i) => i * 25 + 5)
        .text((d) => d)
        .attr("font-size", "12px")
        .attr("fill", "#333");
  
      // Size legend
      const legend_size = chartGroup
        .append("g")
        .attr("transform", `translate(${width / 2 - 50}, 0)`);
  
      legend_size
        .append("rect")
        .attr("x", -55)
        .attr("y", -15)
        .attr("width", 200)
        .attr("height", 170)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 5);
  
      const size_vals = [1, 2, 3, 4];
      const size_labels = ["≤ $7,500", "$7.5k–$11.5k", "$11.5k–$15.5k", "> $15.5k"];
  
      legend_size
        .selectAll("legend-circles")
        .data(size_vals)
        .enter()
        .append("circle")
        .attr("cy", (d, i) => i * 35)
        .attr("r", (d) => z(d))
        .attr("fill", "#999")
        .attr("opacity", 0.5)
        .attr("stroke", "#555");
  
      legend_size
        .selectAll("legend-labels")
        .data(size_labels)
        .enter()
        .append("text")
        .attr("x", 50)
        .attr("y", (d, i) => i * 35 + 5)
        .text((d) => d)
        .attr("font-size", "12px")
        .attr("fill", "#333");
  
      legend_size
        .append("text")
        .attr("x", -13)
        .attr("y", -23)
        .text("Incentive Strength")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .attr("fill", "#333");
    }
  
    d3.csv("data/ev_csv_incentives_and_sales.csv").then(function (d) {
      console.log("got ev incentives and sales dataset");
  
      data = d.map((obj, i) => ({
        ...obj,
        id: i,
        Avg_EV_Incentive: Number(obj.Avg_EV_Incentive),
        Avg_EV_Sales: Number(obj.Avg_EV_Sales),
      }));
  
      drawBubbleChart();
    });
  }