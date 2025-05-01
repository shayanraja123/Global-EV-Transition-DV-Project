import {createPolarChart} from "./js/polarChart.js"
import { createStepSankey } from "./js/stepSankey_vis6.js";
import { create_choropleth_vis1} from "./js/choropleth_vis1.js";
import { create_funnelchart } from "./js/funnelchart_vis11.js";
import { createBatteryCostVis } from "./js/batteryCost_vis2.js";

///////////////////////////////////////////////////////////////////


let currentStep = null
var playdiv=document.getElementById("playdiv");
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
      console.log(step)
      updateVisualization(step);
    }
  });
}, { threshold: 0.59, rootMargin: "0px 0px -10% 0px"});

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
  if (step === currentStep) return;
  currentStep = step;
  vis.selectAll("*").remove();
  // vis.classed("visible", false);

  if (step === 6) {
    container.classed("background-mode", true)

  } else {
    container.classed("background-mode", false)
    vis
      .attr('width', 1000)
      .attr('height', 800)
      .attr('viewBox', [0, 0, 1000, 800])
    console.log('hi')
  }
  
  if (step === 1) {
    create_choropleth_vis1();
      playdiv.style.display = 'block';
  }
  else if (step === 2) {
    createBatteryCostVis();
    playdiv.style.display = 'none';
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
      playdiv.style.display = 'none';
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
      playdiv.style.display = 'none';
  }
  else if (step === 5) {
    
    playdiv.style.display = 'none';
    
  }
  else if (step === 6) {
    createStepSankey()
   
      playdiv.style.display = 'none';
  }
  else if (step === 7) {
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
    playdiv.style.display = 'none';
  }
  else if (step === 8) {
    console.log('again')
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
      playdiv.style.display = 'none';
  }
  else if (step === 9) {
    createPolarChart()
      playdiv.style.display = 'none';
  }
  else if (step === 10) {
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
      playdiv.style.display = 'none';
  }
  else if (step === 11) {
   create_funnelchart();
      playdiv.style.display = 'none';
  }
  else if (step === 12) {
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
      playdiv.style.display = 'none';
  }
    // vis.classed("visible", true);
}