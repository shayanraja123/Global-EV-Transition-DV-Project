export function createwindmill_vis10() {
    // Constants and Initial Setup
    const width = 1000, height = 600;
    const centerX = width / 2;
    const centerY = height / 1.5;



    
  const baseHeight = height * 0.80;
  const bladeLength = baseHeight * 0.75;
  const bladeWidthBottom = 22;
  const radarRadius = 180;
  const radarLevels = 5;
  const radarCategories = ['United States', 'Portugal', 'Vietnam', 'Kenya', 'Brazil', 'Sweden'];

  // State Variables
  let sortAscending = false;
  let groupedData = [], fullData = [], yearIndex = 0, isPlaying = true, yearsList = [], yearScaleContainer;
  let rScale, radarPath;
  let windowStartIndex = 0;
  const windowSize = 13;
  let manuallyPaused = false;
  let justEnteredVis10 = false;


  // DOM Elements
  const svg = d3.select("#main-vis").append("svg")
    .attr("width", width)
    .attr("height", height);

  const yearLabel = svg.append("text")
    .attr("x", width - 300)
    .attr("y", 100)
    .attr("text-anchor", "end")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("fill", "#333");

  const radarSvg = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`);

  // Data Loading
  d3.csv("/share-electricity-renewables/share-electricity-renewables.csv").then(data => {
    data = data.filter(d => +d.Year >= 1990 && +d.Year <= 2023 && d["Renewables - % electricity"] !== "" && !isNaN(+d["Renewables - % electricity"]));
    fullData = data;
    const radarData = data.filter(d => radarCategories.includes(d.Entity));
    const grouped = d3.group(radarData, d => d.Year);
    groupedData = Array.from(grouped.entries()).map(([year, records]) => {
      const values = {};
      radarCategories.forEach(cat => {
        const match = records.find(r => r.Entity === cat);
        values[cat] = match ? Math.min(match["Renewables - % electricity"], 100) : 0;
      });
      return { year: +year, values };
    });
    yearsList = groupedData.map(d => d.year);
    yearScaleContainer = d3.select("#year-scale-sshivap8")
    renderYearScale();
    setupRadarChart();
    rotateBlades();
  });

  // Windmill Visualization
  function setupWindmillVisualization() {
    const baseGradient = svg.append("defs").append("linearGradient")
      .attr("id", "baseGradient")
      .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");

    baseGradient.append("stop").attr("offset", "0%").attr("stop-color", "#D1C8B8");
    baseGradient.append("stop").attr("offset", "50%").attr("stop-color", "#F8F6F3");
    baseGradient.append("stop").attr("offset", "100%").attr("stop-color", "#D1C8B8");

    svg.append("path")
      .attr("d", `M ${centerX - 5},${centerY} 
                  L ${centerX - 25},${centerY + baseHeight - 5} 
                  Q ${centerX - 15},${centerY + baseHeight} ${centerX - 15},${centerY + baseHeight} 
                  L ${centerX + 15},${centerY + baseHeight} 
                  Q ${centerX + 25},${centerY + baseHeight} ${centerX + 25},${centerY + baseHeight - 5} 
                  L ${centerX + 5},${centerY} 
                  Z`)
      .attr("fill", "url(#baseGradient)")
      .attr("stroke", "#555")
      .attr("fill-opacity", 0.4);

    const blades = svg.selectAll(".blade")
      .data([{ angle: 0 }, { angle: 120 }, { angle: 240 }])
      .enter().append("path")
      .attr("class", "blade")
      .attr("d", () => `M ${centerX - bladeWidthBottom/2},${centerY} Q ${centerX - bladeWidthBottom},${centerY - bladeLength * 0.3} ${centerX},${centerY - bladeLength}
        Q ${centerX + bladeWidthBottom},${centerY - bladeLength * 0.3} ${centerX + bladeWidthBottom/2},${centerY} Z`)
      .attr("fill", "#ddd")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .attr("fill-opacity", 0.4)
      .attr("transform", d => `rotate(${d.angle},${centerX},${centerY})`);

    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 10)
      .attr("fill", "#555")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);
  }

  // Radar Chart Functions
  function setupRadarChart() {
    const maxValue = d3.max(groupedData, d => d3.max(radarCategories.map(cat => d.values[cat])));
    rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radarRadius]);
    const angleSlice = Math.PI * 2 / radarCategories.length;
    
    // Radar levels
    for (let level = 1; level <= radarLevels; level++) {
      const levelFactor = rScale(maxValue * level / radarLevels);
      radarSvg.selectAll(`.levels-${level}`)
        .data(radarCategories)
        .enter().append("line")
        .attr("x1", (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y1", (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI/2))
        .attr("x2", (d, i) => levelFactor * Math.cos(angleSlice * (i+1) - Math.PI/2))
        .attr("y2", (d, i) => levelFactor * Math.sin(angleSlice * (i+1) - Math.PI/2))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.4);
        
      radarSvg.append("text")
        .attr("x", 0)
        .attr("y", -levelFactor)
        .attr("dy", "-0.3em")
        .attr("text-anchor", "middle")
        .attr("class", "scaleLabel")
        .text(Math.round(maxValue * level / radarLevels));
    }
    
    // Radar axes
    radarSvg.selectAll(".axis")
      .data(radarCategories)
      .enter().append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y2", (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI/2))
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);
      
    // Radar labels
    radarSvg.selectAll(".axisLabel")
      .data(radarCategories)
      .enter().append("text")
      .attr("class", "axisLabel")
      .attr("x", (d, i) => (rScale(maxValue) + 20) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y", (d, i) => (rScale(maxValue) + 20) * Math.sin(angleSlice * i - Math.PI/2))
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d);
      
    radarPath = radarSvg.append("path")
      .datum(Array(radarCategories.length).fill(0))
      .attr("d", d3.lineRadial()
        .radius((d, i) => rScale(d))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed))
      .attr("fill", "cyan")
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
  }

  function updateRadar(fromClick = false) {
    if (!groupedData.length) return;
    const current = groupedData[yearIndex];
    const values = radarCategories.map(cat => current.values[cat]);
    
    radarPath.datum(values)
      .transition().duration(600)
      .attr("d", d3.lineRadial()
        .radius((d, i) => rScale(d))
        .angle((d, i) => i * (Math.PI * 2 / radarCategories.length))
        .curve(d3.curveLinearClosed));
        
    yearLabel.text(current.year);
    
    // Update data labels
    radarSvg.selectAll(".data-label").remove();
    radarSvg.selectAll(".data-label")
      .data(values)
      .enter()
      .append("text")
      .attr("class", "data-label")
      .attr("x", (d, i) => ((rScale(d) + 15) * Math.cos((i * 2 * Math.PI / radarCategories.length) - Math.PI/2)) - 10)
      .attr("y", (d, i) => ((rScale(d) + 15) * Math.sin((i * 2 * Math.PI / radarCategories.length) - Math.PI/2)))
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#111")
      .text(d => `${d.toFixed(0)}%`);
      
    updateRankings(current.year);
    
    // Update year scale position
    if (yearIndex < windowStartIndex || yearIndex >= windowStartIndex + windowSize) {
      windowStartIndex = Math.max(0, yearIndex - Math.floor(windowSize / 2));
      if (windowStartIndex + windowSize > yearsList.length) {
        windowStartIndex = yearsList.length - windowSize;
      }
      renderYearScale();
    } else {
      highlightActiveYear();
    }
    
    if (!fromClick) {
      yearIndex = (yearIndex + 1) % groupedData.length;
    }
  }

  // Year Scale Functions
  function renderYearScale() {
    const visibleYears = yearsList.slice(windowStartIndex, windowStartIndex + windowSize);
    const yearItems = yearScaleContainer.selectAll(".year-item").data(visibleYears, d => d);
    
    yearItems.exit().remove();
    
    const enterItems = yearItems.enter()
      .append("div")
      .attr("class", "year-item")
      .text(d => d)
      .on("click", (event, d) => {
        yearIndex = yearsList.indexOf(d);
        updateRadar(true);
      });
      
    yearItems.merge(enterItems);
    highlightActiveYear();
  }

  function highlightActiveYear() {
    yearScaleContainer.selectAll(".year-item").classed("active", d => d === yearsList[yearIndex]);
  }

  // Rankings List Functions
  function updateRankings(year) {
    const dataList = d3.select("#data-list-sshivap8");
    const filtered = fullData.filter(d => +d.Year === year);
    let sorted = filtered.map(d => ({ country: d.Entity, value: +d["Renewables - % electricity"] }));
    
    sorted = sortAscending
      ? sorted.sort((a, b) => a.value - b.value)
      : sorted.sort((a, b) => b.value - a.value);
      
    const entries = dataList.selectAll(".data-entry").data(sorted, d => d.country);
    
    entries.exit().transition().duration(300).style("opacity", 0).remove();
    
    const newEntries = entries.enter()
      .append("div")
      .attr("class", "data-entry")
      .style("opacity", 0)
      .html(d => `<span>${d.country}</span><span>${d.value.toFixed(0)}%</span>`);
      
    const allEntries = newEntries.merge(entries).classed("highlighted", d => radarCategories.includes(d.country));
    allEntries.transition().duration(500).style("opacity", 1);
    allEntries.sort((a, b) => sortAscending ? a.value - b.value : b.value - a.value);
  }

  // Animation Functions
  function rotateBlades() {
    if (!isPlaying) {
      svg.selectAll(".blade").interrupt();
      return;
    }
    
    svg.selectAll(".blade").transition().duration(1500)
      .ease(d3.easeLinear)
      .attrTween("transform", function(d) {
        const startAngle = d.angle;
        const endAngle = d.angle + 120;
        const interp = d3.interpolate(startAngle, endAngle);
        return function(t) {
          d.angle = interp(t);
          return `rotate(${d.angle},${centerX},${centerY})`;
        };
      })
      .on("end", function(d, i) {
        d.angle = d.angle % 360;
        if (i === 0) updateRadar();
        rotateBlades();
      });
  }

  // Event Listeners
  document.getElementById("sort-btn-sshivap8").addEventListener("click", () => {
    sortAscending = !sortAscending;
    document.getElementById("sort-btn-sshivap8").textContent = `Sort: ${sortAscending ? "Ascending" : "Descending"}`;
    updateRadar(true);
  });

  // Define toggleBtn correctly before using it
  const toggleBtn = document.getElementById("toggle-btn-sshivap8");
  toggleBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;
    manuallyPaused = !isPlaying;
    toggleBtn.textContent = isPlaying ? "Pause" : "Play";
    if (isPlaying) {
      rotateBlades();
    } else {
      svg.selectAll(".blade").interrupt();
    }
  });

  let scrollTimeout = null;
  let lastScrollTime = 0;
  const scrollCooldown = 150;
  window.addEventListener("wheel", (e) => {
    const windmillStep = document.querySelector(".step[data-step='10']");
    const isVisible = windmillStep.classList.contains("active");
  
    if (!isVisible) return; // only work during step 10
  
    // Only prevent scroll if we are NOT at boundaries
    const delta = e.deltaY;
  
    const atStart = yearIndex === 0 && delta < 0;
    const atEnd = yearIndex === yearsList.length - 1 && delta > 0;
  
    if (!atStart && !atEnd) {
      e.preventDefault(); // trap scroll only in middle range
  
      if (!manuallyPaused) {
        svg.selectAll(".blade").interrupt();
        isPlaying = false;
        toggleBtn.textContent = "Play";
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isPlaying = true;
          toggleBtn.textContent = "Pause";
          rotateBlades();
        }, 500);
      }
  
      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;
      lastScrollTime = now;
  
      if (delta > 0 && yearIndex < yearsList.length - 1) {
        yearIndex++;
      } else if (delta < 0 && yearIndex > 0) {
        yearIndex--;
      }
  
      if (yearIndex >= windowStartIndex + windowSize) {
        windowStartIndex = yearIndex - windowSize + 1;
      } else if (yearIndex < windowStartIndex) {
        windowStartIndex = yearIndex;
      }
  
      renderYearScale();
      updateRadar(true);
    }
    // else: allow normal scrolling to other steps
  }, { passive: false });
  

  // Fix year scale scroll handling
  document.getElementById('year-scale-container-sshivap8').addEventListener('scroll', () => {
    const container = document.getElementById('year-scale-container-sshivap8');
    const itemWidth = 80;
    const scrollLeft = container.scrollLeft;
    const visibleIndex = Math.round(scrollLeft / itemWidth);
    if (visibleIndex !== yearIndex && visibleIndex >= 0 && visibleIndex < yearsList.length) {
      yearIndex = visibleIndex;
      updateRadar(true);
    }
  });

  // Initial Setup
  setupWindmillVisualization();
  const activeYear = document.querySelector(".year-item.active");
  if (activeYear) activeYear.scrollIntoView({ behavior: "smooth", block: "center" });

  // Initial scroll setup fix
  setTimeout(() => {
    const container = document.getElementById('year-scale-container-sshivap8');
    container.scrollLeft = (yearIndex - windowStartIndex) * 60;
  }, 200);
}