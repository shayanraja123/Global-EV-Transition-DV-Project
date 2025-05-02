export function create_choropleth_viz4() {
  const margin = {top: 0, bottom: 300, left: 0, right: 0}

  const width = 1000 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const svg = d3.select("#main-vis")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

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
        var statename;
        if(d.properties.name=="USA"){
          statename="United States of America"
        }
        else{
          statename=d.properties.name;
        }
        const value = dataMap[currentYear]?.[statename]?.sales;
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
          .style("left", (event.pageX < 1100 ? event.pageX + 10 : event.pageX - 300) + "px")
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
      .on("mousemove", function(event, d) {
        tooltip
          .style("left", (event.pageX < 1100 ? event.pageX + 10 : event.pageX - 300) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#999").attr("stroke-width", 1);
        tooltip.transition().duration(300).style("opacity", 0);
      });

    function updateMap(year) {
      currentYear = +year;
      d3.select("#wajaslidervalue").text(currentYear);
      countries.transition().duration(300)
        .attr("fill", d => {
          var statename;
        if(d.properties.name=="USA"){
          statename="United States of America"
        }
        else{
          statename=d.properties.name;
        }
          const value = dataMap[year]?.[statename]?.sales;
          return value !== undefined ? colorScale(value) : "#ccc";
        });
    }

    window.wajaplayclicked = function () {
      const playbtn = document.getElementById("wajaplaybtn");
      const slider = document.getElementById("wajaslider");
      const slidervalue = document.getElementById("wajaslidervalue");

      if (!isPlaying) {
        isPlaying = true;
        playbtn.innerHTML = "Pause";
        // slider.disabled = true;
        let year=parseInt(slider.value);
        // let year = 2010;
        timer = setInterval(() => {
          if (year > 2023) {
            stopAutoplay();
            slider.value = 2010;
            slidervalue.textContent = 2010;
            updateMap(2010);
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

    window.wajasliderchanged = function () {
      const slider = document.getElementById("wajaslider");
      const value = +slider.value;
      document.getElementById("wajaslidervalue").textContent = value;
      updateMap(value);
    };

    function stopAutoplay() {
      isPlaying = false;
      clearInterval(timer);
      document.getElementById("wajaplaybtn").innerHTML = "Play";
      document.getElementById("wajaslider").disabled = false;
    }

    const slider = document.getElementById("wajaslider");
    const playdiv = document.getElementById("wajaplaydiv");
    const play_div = d3.select('#wajaplaydiv')
    play_div.style('margin-top', '-220px')
    if (slider && playdiv) {
      // playdiv.style.position = "absolute";
      // playdiv.style.left = "220px";
      // playdiv.style.bottom = "10px";
      slider.setAttribute("min", "2010");
      slider.setAttribute("max", "2023");
      slider.setAttribute("value", "2010");
      document.getElementById("wajaslidervalue").textContent = "2010";
    }

    updateMap(2010);
  });
}