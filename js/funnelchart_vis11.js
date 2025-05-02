var margin = ({top: 70, right: 70, bottom: 70, left: 70})
var data;
var seconddata;
var newdata;
var width=1000;
var height=800;
var x;
var y;
var area;
var areaMirror;
export function create_funnelchart(){
   seconddata=[];
   newdata=[]
Promise.all([ d3.csv("../data/IEA-EV-dataEV salesProjection-STEPSCars.csv")]).then(function ([data]){
//console.log(data);
data=data.filter(function(row){
    if(row['region']=="World"){
        if(row['parameter']=='EV sales'){
            if(row['mode']=='Cars'){
                if((row['powertrain']=='BEV') || (row['powertrain']=='PHEV') || (row['powertrain']=='FCEV')){
                    if(row['unit']=='Vehicles'){
                        return true;
                    }
                    else{

                        return false;
                    }
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
})
//console.log(data);

var dl=data.length;
var stepindex=1;
for(var i=0;i<=dl-3;i+=3){
  var row={}
  row['step']=parseFloat(stepindex++);
  row['value']=parseInt(data[i]['value'])+parseInt(data[i+1]['value'])+parseInt(data[i+2]['value'])
  row['label']=data[i]['year']
  
newdata.push(row);
// row={}
//   row['step']=parseFloat((i+1)+".1");
//   row['value']=parseInt(data[i]['value'])
// newdata.push(row);
}
//console.log(newdata);
seconddata=newdata;
// for(var i=0;i<dl;i++){
// var row=newdata[i];
// seconddata.push(row);
// // if(i<dl-1){
// //   row2={'step':parseFloat(row['step']+".0"),'value':newdata[i]['value']}
// //   row3={'step':parseFloat(row['step']+".9"),'value':newdata[i+1]['value']}
// //   seconddata.push(row2);
// //   seconddata.push(row3); 
// // }
// // else{
// //   row2={'step':parseFloat(row['step']+".0"),'value':newdata[i]['value']}
// //   row3={'step':parseFloat(row['step']+".9"),'value':newdata[i]['value']+10000000}
// //   seconddata.push(row2);
// //   seconddata.push(row3); 
// // }

// }
//console.log(seconddata)
x = d3.scaleUtc()
    .domain(d3.extent(seconddata, ({step}) => step))
    .range([margin.left, width - margin.right])

y = d3.scaleLinear()
.domain([-d3.max(newdata, ({value}) => value), d3.max(newdata, ({value}) => value)]).nice()
.range([height - margin.bottom, margin.top])


areaMirror = d3.area()
    .x(({step}) => x(step))
    .y0(y(0))
    .y1(({value}) => y(-value))

area = d3.area()
.x(({step}) => x(step))
.y0(y(0))
.y1(({value}) => y(value))


chart()
})
    
function chart(){
    var funnelchartsvg = d3.select('#main-vis')
    
    funnelchartsvg.append('path')
        .datum(seconddata)
        .attr('fill','blue')
        .attr('d', area);
    
    funnelchartsvg.append('path')
      .datum(seconddata)
      .attr('fill', 'blue')
      .attr('d', areaMirror);
  
    funnelchartsvg.selectAll('.values')
      .data(newdata)
      .enter()
      .append('text')
        .attr('class', 'values')
        .attr('x', ({ step }) => x(step) + 10)
        .attr('y', 50)
        .text(({ value }) => d3.format(".2s")(value))
        .attr('style', `
          fill: "black";
          font-size: 22px;
        `);
    
    funnelchartsvg.selectAll('.labels')
      .data(newdata)
      .enter()
      .append('text')
        .attr('class', 'labels')
        .attr('x', ({ step }) => x(step) + 10)
        .attr('y', 70)
        .text(({ label }) => label)
        .attr('style', `
            fill: "black"};
           
            font-size: 18px;
        `);
    
    
        
    funnelchartsvg.selectAll('line')
      .data(d3.range(1, newdata.length + 1))
      .enter()
      .append('line')
        .attr('x1', value => x(value))
        .attr('y1', 30)
        .attr('x2', value => x(value))
        .attr('y2', height - 30)
        .style('stroke-width', 1)
        .style('stroke', "orange")
        .style('fill', 'none');
    
    return funnelchartsvg.node();
  }
}
