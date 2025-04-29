import {createPolarChart} from "./js/polarChart.js"
import { createStepSankey } from "./js/stepSankey_vis6.js";


const steps = d3.selectAll(".step");
const vis = d3.select("#main-vis")
  .attr('width', 1000)
  .attr('height', 800)
const container = d3.select("#scrolly-container")

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      steps.classed("active", false);
      d3.select(entry.target).classed("active", true);

      const step = +entry.target.dataset.step;
      updateVisualization(step);
    }
  });
}, { threshold: 0.5 });

steps.each(function() {
  observer.observe(this);
});

const totalHeight = document.body.scrollHeight - window.innerHeight;
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY;
  const scrollPercent = (scrollPos / totalHeight) * 100;
  document.getElementById('progress-bar').style.width = `${scrollPercent}%`;
});

function updateVisualization(step) {
  vis.selectAll("*").remove();
  // vis.classed("visible", false);

  if (step === 7) {
    container.classed("background-mode", true)
    vis
      .attr('width', 1000)
      .attr('height', 800)

  } else {
    container.classed("background-mode", false)
    vis
      .attr('width', 1000)
      .attr('height', 800)
  }

  if (step === 1) {
    vis.append("circle")
      .attr("cx", 300)
      .attr("cy", 200)
      .attr("r", 0)
      .attr("fill", "#4CAF50")
      .transition()
      .duration(800)
      .attr("r", 50);
  }
  else if (step === 2) {
    vis.append("line")
      .attr("x1", 100)
      .attr("y1", 350)
      .attr("x2", 100)
      .attr("y2", 350)
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 5)
      .transition()
      .duration(800)
      .attr("x2", 500)
      .attr("y2", 50);
  }
  else if (step === 3) {
    vis.selectAll("rect")
      .data([100, 200, 300])
      .enter()
      .append("rect")
      .attr("x", (d, i) => 100 + i * 120)
      .attr("y", 400)
      .attr("width", 80)
      .attr("height", 0)
      .attr("fill", "#FF9800")
      .transition()
      .duration(800)
      .attr("y", d => 400 - d)
      .attr("height", d => d);
  }
  else if (step === 4) {
    vis.append("text")
      .attr("x", 100)
      .attr("y", 400)
      .attr("font-size", "0px")
      .attr("fill", "#673AB7")
      .text("Top EV-Adopting Countries")
      .transition()
      .duration(800)
      .attr("y", 200)
      .attr("font-size", "24px");
  }
  else if (step === 5) {
    createPolarChart()
    
  }
  else if (step === 6) {
    vis.append("text")
      .attr("x", 100)
      .attr("y", 400)
      .attr("font-size", "0px")
      .attr("fill", "#673AB7")
      .text("More top stuff")
      .transition()
      .duration(800)
      .attr("y", 200)
      .attr("font-size", "24px");
  }
  else if (step === 7) {
    createStepSankey()
  }
  else if (step === 8) {
    vis.selectAll("rect")
      .data([100, 200, 300])
      .enter()
      .append("rect")
      .attr("x", (d, i) => 100 + i * 120)
      .attr("y", 400)
      .attr("width", 80)
      .attr("height", 0)
      .attr("fill", "#FF9800")
      .transition()
      .duration(800)
      .attr("y", d => 400 - d)
      .attr("height", d => d);
  }
    // vis.classed("visible", true);
}