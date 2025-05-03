var playstatus=false;
    var interval;
    var svg = d3.select("#main-vis")
    const chartMargins = { top: 100, right: 40, bottom: 100, left: 80 },
      chartWidth = 1000 - chartMargins.left - chartMargins.right,
      chartHeight = 800 - chartMargins.top - chartMargins.bottom;
    
    //.style("width",800).style("height",550).style("display","block").style("flex-direction","column");
var path = d3.geoPath();

var projection = d3.geoMercator()
  .scale(120)
  .center([-70,80])
  .translate([360 , 80]);
  var co2map = new Map();
  var colorscale = d3.scaleThreshold()
  .domain([1000000, 3000000, 10000000, 30000000, 100000000, 300000000,1000000000])
  .range([d3.interpolateYlOrBr(0.1),d3.interpolateYlOrBr(0.2),d3.interpolateYlOrBr(0.3),d3.interpolateYlOrBr(0.5),d3.interpolateYlOrBr(0.6),d3.interpolateYlOrBr(0.7),d3.interpolateYlOrBr(0.8),d3.interpolateYlOrBr(1)]);
export function create_choropleth_vis1(){
  svg
    .attr("width", chartWidth + chartMargins.left + chartMargins.right)
    .attr("height", chartHeight + chartMargins.top + chartMargins.bottom - 40)
    .append("g")
        .attr("transform", `translate(${chartMargins.left},${chartMargins.top})`);

  // const play_div = d3.select('#playdiv')
  // play_div.style('margin-top', '-250px')
     
 function playclicked(){
  
  var playbtn=document.getElementById("playbtn");
  var slider=document.getElementById("slider");
  var slidervalue=document.getElementById("slidervalue");
  if(playstatus==false){
    playstatus=true;
    playbtn.innerHTML="Pause";
    slider.disabled=true;
    slider.style.backgroundColor="blue"
  var number=parseInt(slider.value);
      var slideryear=number;
             interval=setInterval(function(){
              if(slideryear>=2022){
                  clearInterval(interval);
                  playstatus=false;
                  slider.disabled=false;
                  playbtn.innerHTML="Play";
              }
              else{
                slider.value=slideryear;
                slidervalue.value=slideryear;
                sliderchanged();
               
                slideryear++;
              }
          },500);
  }
  else{
    clearInterval(interval);
    playstatus=false;
    playbtn.innerHTML="Play";            
    slider.disabled=false;
                 
  }

}
function sliderchanged(){
  //console.log("co2map ",co2map);
  var slider=document.getElementById("slider");
  var slideryear=parseInt(slider.value);
  var value=slider.value;
  document.getElementById("slidervalue").innerHTML=value;

  svg
  .selectAll("path")
  .transition()
  .attr("fill",function(d){
    if(co2map.get(slideryear).has(d.properties.name)){
      return colorscale(co2map.get(slideryear).get(d.properties.name));
    }
    else{
return "black"
    }
  })
}
window.playclicked=playclicked;
window.sliderchanged=sliderchanged;
  
      //d3.interpolateYIRd
      //d3.schemeOranges[7]
   
    
   
    
    var maxnumber=0;
    // d3.queue()
    //   .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    //   .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
    //   .await(ready);
    
    var promises=[];
    promises.push(d3.json("./data/world.geojson"))
    promises.push(d3.csv("./data/co2-emissions-transport.csv"))
    Promise.all(promises).then(function(result){
      //console.log(result);
      result[1].forEach(function(d){
        maxnumber=Math.max(maxnumber,+d["Carbon dioxide emissions from transport"])
        var country=d["Entity"]
        if(d["Code"]=="USA"){
    country="USA";
        }
        if(co2map.has(+d["Year"])){
     var map=co2map.get(+d["Year"]);
    
     map.set(country,+d["Carbon dioxide emissions from transport"]);
     co2map.set(+d["Year"],map);
        }
        else{
          
          var map=new Map();
         
          map.set(country,+d["Carbon dioxide emissions from transport"]);
          co2map.set(+d["Year"],map);
          
        }
       
      })
      // console.log(co2map);
       //console.log("maxnumber: ",maxnumber)
      // var orangecolor=d3.scaleSequential(d3.interpolateOranges)
      
      ready(result[0])
      Legend(colorscale, {
        title:'Global CO2  emissions in tonnes',
        tickFormat:'.1s',
        tickSize: 0
      })
    })

    d3.select("#main-vis").append("svg")
    .attr("id","colorlegend")
    .style("opacity",1)
    .attr("x",260)
    .attr("y",530)

   

}


function ready( topo) {

  svg
    .selectAll("path")
    .data(topo.features.filter(d=>d.properties.name!="Antarctica"))
    .enter()
    .append("path")
      .attr("id",(d)=>d.properties.name)
      .attr("d", d3.geoPath()
        .projection(projection)
      )
  
      .attr("fill", function (d) {
       // return "blue";
        //d.total = data.get(d.id) || 0;
    
        if(co2map.get(1990).has(d.properties.name)){
          return colorscale(co2map.get(1990).get(d.properties.name));
        }
        else{
return "black"
        }
        
      })
      .attr("stroke","black")
     // return svg;
    }

    function Legend(color, {
      title,
      tickSize = 6,
      width = 520, 
      height = 44 + tickSize,
      marginTop = 18,
      marginRight = 0,
      marginBottom = 16 + tickSize,
      marginLeft = 0,
      ticks = width / 64,
      tickFormat,
      tickValues
    } = {}) {
    
      function ramp(color, n = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
          context.fillStyle = color(i / (n - 1));
          context.fillRect(i, 0, 1, 1);
        }
        return canvas;
      }
    
      const svg = d3.select("#colorlegend")
          .attr("width",width)
          .attr("height", height)
         .attr("viewBox", [0, 0, width, height])
          .style("overflow", "visible")
          .style("display", "block");
    
      let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
      let x;
    
   
      if (color.invertExtent) {
        const thresholds
            = color.thresholds ? color.thresholds() 
            : color.quantiles ? color.quantiles() 
            : color.domain(); 
    
        const thresholdFormat
            = tickFormat === undefined ? d => d
            : typeof tickFormat === "string" ? d3.format(tickFormat)
            : tickFormat;
    
        x = d3.scaleLinear()
            .domain([-1, color.range().length - 1])
            .rangeRound([marginLeft, width - marginRight]);
    
        svg.append("g")
          .selectAll("rect")
          .data(color.range())
          .join("rect")
            .attr("x", (d, i) => x(i - 1))
            .attr("y", marginTop)
            .attr("width", (d, i) => x(i) - x(i - 1))
            .attr("height", height - marginTop - marginBottom)
            .attr("fill", d => d);
    
        tickValues = d3.range(thresholds.length);
        tickFormat = i => thresholdFormat(thresholds[i], i).replace('G','B t').replace('M', 'M t');
       
      }
    
    
      svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
          .call(tickAdjust)
          .call(g => g.select(".domain").remove())
          .call(g => g.append("text")
            .attr("x", marginLeft)
            .attr("y", marginTop + marginBottom - height - 6)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("class", "title")
            .text(title));

            svg.append("rect").attr("x",200).attr("y",60).attr("width",10).attr("height",10).style("fill", "black")
svg.append("text").attr("x", 220).attr("y", 65).text("No data").style("font-size", "15px").attr("alignment-baseline","middle")
    
      return svg.node();
    }

