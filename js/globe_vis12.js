// js/globe_vis12.js
export function createGlobe() {

    console.log("✅ createGlobe called");

Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.csv("./data/emissions.csv")
]).then(([world, emissions]) => {
  console.log("✅ World + emissions data loaded");

}).catch(error => {
    console.error("❌ Error loading data:", error);
  });

    const width = 800, height = 600;
    const sensitivity = 100;
  
    const projection = d3.geoOrthographic()
      .scale(300)
      .translate([width / 2, height / 2])
      .rotate([0, -30]);
  
    const path = d3.geoPath().projection(projection);
    const svg = d3.select("#main-vis").attr("width", width).attr("height", height);
    const tooltip = d3.select('#tooltip_vis12');
  
    svg.selectAll("*").remove(); 
    const globe = svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale())
      .attr("fill", "#aaf");
  
    const g = svg.append("g");
  
    const formatEmission = d3.format(".2s");
    let emissionsData = {};
    let countriesFeatures = null;
  
    Promise.all([
      d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
      d3.csv("./data/emissions.csv")
    ]).then(([world, emissions]) => {
      const countries = topojson.feature(world, world.objects.countries);
      countriesFeatures = countries.features;
  
      emissions.forEach(row => {
        const countryName = row.Entity;
        const year = +row.Year;
        const emission = +row.transport_co2_emissions;
  
        if (!emissionsData[countryName]) {
          emissionsData[countryName] = {};
        }
  
        emissionsData[countryName][year] = emission;
      });
  
      function updateGlobe(year) {
        g.selectAll("path").remove();
  
        const emissionsList = countriesFeatures.map(d => emissionsData[d.properties.name]?.[year] || 0);
        const maxEmission = d3.max(emissionsList);
  
        const colorScale = d3.scaleSequential(d3.interpolateOrRd)
          .domain([0, maxEmission || 1]);
  
        const paths = g.selectAll("path")
          .data(countriesFeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            const emission = emissionsData[d.properties.name]?.[year] || 0;
            tooltip
              .style("display", "block")
              .style('opacity', 1)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 30) + "px")
              .html(`<strong>${d.properties.name}</strong><br/>${formatEmission(emission)} t CO₂`);
          })
          .on("mouseout", function () {
            tooltip.style("display", "none");
          });
  
        paths.transition()
          .duration(800)
          .attr("fill", d => {
            const emission = emissionsData[d.properties.name]?.[year] || 0;
            return emission > 0 ? colorScale(emission) : "#ccc";
          });
      }
  
      let currentYear = 1990;
      updateGlobe(currentYear);
  
      // Slider input listener
      d3.select("#year-slider").on("input", function () {
        currentYear = +this.value;
        d3.select("#year-label").text(currentYear);
        updateGlobe(currentYear);
      });
  
      // Globe dragging
      let isDragging = false;
      svg.call(d3.drag()
        .on("start", () => { isDragging = true; })
        .on("drag", function (event) {
          const rotate = projection.rotate();
          const k = sensitivity / projection.scale();
          projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
          ]);
          path.projection(projection);
          g.selectAll("path").attr("d", path);
        })
        .on("end", () => {
          isDragging = false;
          lastTime = Date.now();
        }));
  
      // Auto year animation
      let playAnimation = true;
      let animationInterval = null;
  
      function animate() {
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = setInterval(() => {
          if (!playAnimation) return;
          currentYear++;
          if (currentYear > 2035) currentYear = 1990;
          d3.select("#year-slider").property("value", currentYear);
          d3.select("#year-label").text(currentYear);
          updateGlobe(currentYear);
        }, 1000);
      }
  
      // Play/Pause button
      const playPauseBtn = d3.select("#play-pause-btn");
      playPauseBtn.on("click", function () {
        playAnimation = !playAnimation;
        playPauseBtn.text(playAnimation ? "Pause" : "Play");
        if (playAnimation) {
          animate();
        } else {
          clearInterval(animationInterval);
        }
      });
  
      animate();
  
      // Auto rotate
      let rotationSpeed = 0.02;
      let lastTime = Date.now();
      function autoRotate() {
        const now = Date.now();
        const delta = now - lastTime;
        if (!isDragging) {
          const rotate = projection.rotate();
          rotate[0] += rotationSpeed * delta;
          projection.rotate(rotate);
          path.projection(projection);
          g.selectAll("path").attr("d", path);
        }
        lastTime = now;
        requestAnimationFrame(autoRotate);
      }
      autoRotate();
    });
  }
  