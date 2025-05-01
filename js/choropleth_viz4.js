export function create_choropleth_viz4() {
  const width = 960;
  const height = 540;

  const svg = d3.select("#main-vis")
    .attr("width", width)
    .attr("height", height);

  // Add legend container before timeline
  const legendGroup = svg.append("g")
    .attr("id", "legend-group")
    .attr("transform", `translate(${(width - 7 * 60) / 2}, ${height +20})`); // adjust as needed

  const legendData = [
    { color: "#f7f7f7", label: "0" },
    { color: "#fee8c8", label: "100K" },
    { color: "#fdbb84", label: "200K" },
    { color: "#fc8d59", label: "500K" },
    { color: "#ef6548", label: "1M" },
    { color: "#d7301f", label: "2M" },
    { color: "#990000", label: "5M+" }
  ];

  legendGroup.selectAll("g")
    .data(legendData)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * 60}, 0)`)
    .each(function (d) {
      const g = d3.select(this);
      g.append("rect")
        .attr("width", 30)
        .attr("height", 10)
        .attr("fill", d.color);

      g.append("text")
        .attr("y", 20)
        .attr("x", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .text(d.label);
    });

  const projection = d3.geoNaturalEarth1()
    .scale(160)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const colorScale = d3.scaleThreshold()
    .domain([0, 100000, 200000, 500000, 1000000, 2000000, 5000000])
    .range(["#f7f7f7", "#fee8c8", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"]);

  let dataMap = {};
  let currentYear = 2023;
  let isPlaying = false;
  let timer;

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
    d3.csv("./data/electric-car-sales.csv")
  ]).then(([world, data]) => {

    data.forEach(d => {
      const name = countryNameMap[d.Entity] ?? d.Entity;
      if (!name) return;

      const year = d.Year;
      const sales = +d["Electric cars sold"];

      if (!dataMap[year]) dataMap[year] = {};
      dataMap[year][name] = dataMap[year][name] || { sales: 0, timeseries: [] };
      dataMap[year][name].sales = sales;

      const timeseries = [];
      for (let y = 2010; y <= 2023; y++) {
        const row = data.find(r => (countryNameMap[r.Entity] ?? r.Entity) === name && +r.Year === y);
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
          const y = d3.scaleLinear().domain([0, d3.max(countryData.timeseries, d => d.sales)]).range([50, 0]);
          const line = d3.line().x(d => x(d.year)).y(d => y(d.sales || 0));
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
      currentYear = +year;
      d3.select("#slidervalue").text(currentYear);
      countries.transition().duration(300)
        .attr("fill", d => {
          const value = dataMap[year]?.[d.properties.name]?.sales;
          return value !== undefined ? colorScale(value) : "#ccc";
        });
    }

    window.playclicked = function () {
      const playbtn = document.getElementById("playbtn");
      const slider = document.getElementById("slider");
      const slidervalue = document.getElementById("slidervalue");

      if (!isPlaying) {
        isPlaying = true;
        playbtn.innerHTML = "Pause";
        // slider.disabled = true;
        let year = 2010;
        timer = setInterval(() => {
          if (year > 2023) {
            stopAutoplay();
            slider.value = 2010;
            slidervalue.textContent = 2010;
            updateMap(2023);
            return;
          } else {
            slider.value = year;
            slidervalue.textContent = year;
            updateMap(year);
            year++;
          }
        }, 1000);
      } else {
        stopAutoplay();
      }
    };

    window.sliderchanged = function () {
      const slider = document.getElementById("slider");
      const value = +slider.value;
      document.getElementById("slidervalue").textContent = value;
      updateMap(value);
    };

    function stopAutoplay() {
      isPlaying = false;
      clearInterval(timer);
      document.getElementById("playbtn").innerHTML = "Play";
      document.getElementById("slider").disabled = false;
    }

    const slider = document.getElementById("slider");
    const playdiv = document.getElementById("playdiv");
    if (slider && playdiv) {
      playdiv.style.position = "absolute";
      playdiv.style.left = "220px";
      playdiv.style.bottom = "10px";
      slider.setAttribute("min", "2010");
      slider.setAttribute("max", "2023");
      slider.setAttribute("value", "2023");
      document.getElementById("slidervalue").textContent = "2023";
    }

    updateMap(2023);
  });
}