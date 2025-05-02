import {createPolarChart} from "./js/polarChart.js"
import { createStepSankey } from "./js/stepSankey_vis6.js";
import { create_choropleth_vis1} from "./js/choropleth_vis1.js";
import { create_funnelchart } from "./js/funnelchart_vis11.js";
import { createBatteryCostVis } from "./js/batteryCost_vis2.js";
import { createEVCarSalesVis } from "./js/carSales_vis3.js";
import { createEVIncentiveBubbleChart } from "./js/bubbleChart_vis5.js";
import { createGlobe } from "./js/globe_vis12.js";
import {create_choropleth_viz4} from "./js/choropleth_viz4.js"
import { createLithiumCobaltVis } from "./js/cobaltBarChart_vis8.js";
import { createwindmill_vis10} from "./js/windmill_vis10.js"
import { createLinechart  } from "./js/linechart_vis7.js";

///////////////////////////////////////////////////////////////////


let currentStep = null
var playdiv=document.getElementById("playdiv");
var slider1=document.getElementById("slider");
var slidervalue1=document.getElementById("slidervalue");
var wajaplaydiv=document.getElementById("wajaplaydiv");
var wajaslider=document.getElementById("wajaslider");
var wajaslidervalue=document.getElementById("wajaslidervalue");
var shivamslider=document.getElementById("year-slider");
var shivamslidervalue=document.getElementById("year-label");
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

  document.getElementById("main-vis").style.display = "block";
  document.getElementById("vis8-container").style.display = "none";

  vis.selectAll("*").remove();
  // vis.classed("visible", false);

  if (step === 6) {
    container.classed("background-mode", true)
    console.log('i am here')

  } 
  else if (step === 10 && window.windmillReady === false) {
    console.log("Delaying re-entry to vis10");
    return; // wait until windmill is ready
  }
  else {
    container.classed("background-mode", false)
    vis
      .attr('width', 1000)
      .attr('height', 800)
      .attr('viewBox', [0, 0, 1000, 800])

    console.log('hi')
  }

  document.getElementById("globe-controls").style.display = "none";
  const windmillUI = document.getElementById("windmill-ui");
  windmillUI.style.display = (step === 10) ? "block" : "none";
  
  if (step === 1) {
    slider1.value=1990;
    slidervalue1.innerHTML=1990;
    create_choropleth_vis1();
      playdiv.style.display = 'block';
      wajaplaydiv.style.display="none";
  }
  else if (step === 2) {
    createBatteryCostVis();
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 3) {
    createEVCarSalesVis();
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 4) {
    wajaslider.value=2010;
    wajaslidervalue.innerHTML=2010;
    create_choropleth_viz4(); 
    playdiv.style.display = 'none';
    wajaplaydiv.style.display = 'block';
  }
  else if (step === 5) {
    createEVIncentiveBubbleChart();
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 6) {
    createStepSankey()
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 7) {
    createLinechart();
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 8) {
    document.getElementById("main-vis").style.display = "none";
    document.getElementById("vis8-container").style.display = "block";
    createLithiumCobaltVis();
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 9) {
    createPolarChart()
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  }
  else if (step === 10) {
    playdiv.style.display = 'none';
    wajaplaydiv.style.display="none";
  
    // Reset scroll state for windmill to prevent bounce-forward
    window.yearIndexForWindmill = 0;
  
    setTimeout(() => {
      createwindmill_vis10();
    }, 1000);
  }
  else if (step === 11) {
   create_funnelchart();
      playdiv.style.display = 'none';
      wajaplaydiv.style.display="none";
  }
  else if (step === 12) {
    createGlobe();
      playdiv.style.display = 'none';
      wajaplaydiv.style.display="none";
      document.getElementById("globe-controls").style.display = "block";
  }
    // vis.classed("visible", true);
}