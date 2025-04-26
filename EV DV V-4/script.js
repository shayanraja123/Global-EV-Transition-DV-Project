const width = 960;
const height = 600;
const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// Color scale thresholds
const colorScale = d3.scaleThreshold()
  .domain([0, 100000, 200000, 500000, 1000000, 2000000, 5000000])
  .range(["#f7f7f7", "#fee8c8", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"]);

let dataMap = {};
let currentYear = "2023";
let isPlaying = false;
let timer;

// Fix mismatches between dataset and GeoJSON
const countryNameMap = {
  "United States": "United States of America",
  "Russia": "Russian Federation",
  "South Korea": "Republic of Korea",
  "North Korea": "Dem. Rep. Korea",
  "Vietnam": "Viet Nam",
  "Iran": "Iran (Islamic Republic of)",
  "Syria": "Syrian Arab Republic",
  "Laos": "Lao People's Democratic Republic",
  "Moldova": "Republic of Moldova",
  "Venezuela": "Venezuela (Bolivarian Republic of)",
  "Tanzania": "United Republic of Tanzania",
  "Democratic Republic of Congo": "Democratic Republic of the Congo",
  "Republic of Congo": "Republic of the Congo",
  "Ivory Coast": "Côte d'Ivoire",
  "Czech Republic": "Czechia",
  "Slovakia": "Slovak Republic",
  "Myanmar": "Myanmar",
  "Bolivia": "Bolivia (Plurinational State of)",
  "Brunei": "Brunei Darussalam",
  "Cape Verde": "Cabo Verde",
  "Swaziland": "Eswatini",
  "East Timor": "Timor-Leste",
  "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
  "Palestine": "State of Palestine",
  "Libya": "Libyan Arab Jamahiriya",
  "Macau": "Macao",
  "Hong Kong": "Hong Kong SAR",
  "Curaçao": "Netherlands",
  "Europe": null,
  "European Union (27)": null
};

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("electric-car-sales.csv")
]).then(([world, data]) => {
  // Reformat and normalize country names
  data.forEach(d => {
    const originalName = d.Entity;
    const name = countryNameMap[originalName] ?? originalName;
    if (!name) return; // skip non-country entries

    const year = d.Year;
    const sales = +d["Electric cars sold"];

    if (!dataMap[year]) dataMap[year] = {};
    dataMap[year][name] = dataMap[year][name] || { sales: 0, timeseries: [] };
    dataMap[year][name].sales = sales;

    const timeseries = [];
    for (let y = 2010; y <= 2023; y++) {
      const row = data.find(r =>
        (countryNameMap[r.Entity] ?? r.Entity) === name && +r.Year === y
      );
      timeseries.push({ year: y, sales: row ? +row["Electric cars sold"] : 0 });
    }

    for (let y = 2010; y <= 2023; y++) {
      if (!dataMap[y]) dataMap[y] = {};
      if (!dataMap[y][name]) dataMap[y][name] = {};
      dataMap[y][name].timeseries = timeseries;
    }
  });

  const countries = svg.append("g")
    .selectAll("path")
    .data(world.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => {
      const value = dataMap[currentYear]?.[d.properties.name]?.sales;
      return value !== undefined ? colorScale(value) : "#ccc";
    })
    .attr("stroke", "#999")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 1.5);
      const countryData = dataMap[currentYear]?.[d.properties.name];

      tooltip.transition().duration(200).style("opacity", 0.95);
      tooltip.html(`
        <strong>${d.properties.name}</strong><br/>
        Year: ${currentYear}<br/>
        EV Sales: ${countryData?.sales !== undefined ? countryData.sales.toLocaleString() : "No data"}<br/>
        <svg id="mini-chart" width="200" height="50"></svg>
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px");

      if (countryData?.timeseries) {
        const x = d3.scaleLinear().domain([2010, 2023]).range([0, 200]);
        const y = d3.scaleLinear()
          .domain([0, d3.max(countryData.timeseries, d => d.sales)])
          .range([50, 0]);

        const line = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.sales || 0));

        d3.select("#mini-chart").append("path")
          .datum(countryData.timeseries)
          .attr("d", line)
          .attr("stroke", "#ff6600")
          .attr("stroke-width", 1.5)
          .attr("fill", "none");
      }
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "#999").attr("stroke-width", 1);
      tooltip.transition().duration(300).style("opacity", 0);
    });

  function updateMap(year) {
    currentYear = year.toString();
    d3.select("#year-label").text(`Year: ${year}`);
    countries.transition().duration(300)
      .attr("fill", d => {
        const value = dataMap[year]?.[d.properties.name]?.sales;
        return value !== undefined ? colorScale(value) : "#ccc";
      });
  }

  // Slider logic
  d3.select("#year-slider").on("input", function () {
    stopAutoplay();
    updateMap(this.value);
  });

  // Play button
  const playBtn = document.getElementById("play-button");

  playBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    if (isPlaying) {
      timer = setInterval(() => {
        let next = +currentYear + 1;
        if (next > 2023) next = 2010;
        updateMap(next);
        d3.select("#year-slider").property("value", next);
      }, 2000);
    } else {
      stopAutoplay();
    }
  });

  function stopAutoplay() {
    isPlaying = false;
    clearInterval(timer);
    playBtn.textContent = "▶";
  }

  updateMap(currentYear);
});
