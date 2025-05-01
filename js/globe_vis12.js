const width = 800, height = 600;
const sensitivity = 100;

const projection = d3.geoOrthographic()
    .scale(300)
    .translate([width / 2, height / 2])
    .rotate([0, -30]);

const path = d3.geoPath().projection(projection);
const svg = d3.select("#globe");
const tooltip = d3.select("#tooltip");

const globe = svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", projection.scale())
    .attr("fill", "#aaf");

const g = svg.append("g");

const formatEmission = d3.format(".2s");  

let emissionsData = {}; // { 'USA': {1990: value, 1991: value, ...}, ... }
let countriesFeatures = null;

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("emissions.csv") 
]).then(([world, emissions]) => {

    const countries = topojson.feature(world, world.objects.countries);
    countriesFeatures = countries.features;

    // Preprocess emissions
    emissions.forEach(row => {
        const countryName = row.Entity;
        const year = +row.Year;
        const emission = +row.transport_co2_emissions;

        if (!emissionsData[countryName]) {
            emissionsData[countryName] = {};
        }

        emissionsData[countryName][year] = emission;
    });

    const colorScale = d3.scaleSequential(d3.interpolateOrRd).domain([0, 100000000]);

    function updateGlobe(year) {
        g.selectAll("path").remove();

         // Gather emissions for the current year
        const emissionsList = countriesFeatures.map(d => emissionsData[d.properties.name]?.[year] || 0);
        const maxEmission = d3.max(emissionsList);

        const colorScale = d3.scaleSequential(d3.interpolateOrRd)
            .domain([0, maxEmission || 1]);  // fallback to 1 to avoid NaN

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
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px")
                    .html(`<strong>${d.properties.name}</strong><br/>${formatEmission(emission)} t CO₂`);
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            });

        // Transition fill color smoothly
        paths.transition()
            .duration(800)
            .attr("fill", d => {
                const emission = emissionsData[d.properties.name]?.[year] || 0;
                return emission > 0 ? colorScale(emission) : "#ccc";
            });
    }

    // Initialize
    let currentYear = 1990;
    updateGlobe(currentYear);

    // Update year on slider input
    d3.select("#year-slider").on("input", function () {
        currentYear = +this.value;
        d3.select("#year-label").text(currentYear);
        updateGlobe(currentYear);
    });

    // Drag to rotate globe
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
            lastTime = Date.now(); // reset lastTime to avoid jumps
        }));


    // Animate years over time
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

    // Play/Pause Button logic
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

// Start animation initially
animate();

    // Auto-rotate globe
    let rotationSpeed = 0.02; // degrees per ms
    let lastTime = Date.now();

    function autoRotate() {
        const now = Date.now();
        const delta = now - lastTime;
        if(!isDragging) {
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
