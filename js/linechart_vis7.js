export function createLinechart() {
    // 1. Target the main-vis SVG container — the same used for other visualizations
    const vis = d3.select("#main-vis");
  
    // 2. Clear it and insert a <foreignObject> to hold HTML chart
    vis.selectAll("*").remove();
  
    // 3. Append a foreignObject to embed HTML-based ECharts into SVG
    const fo = vis.append("foreignObject")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 1000)
      .attr("height", 600);
  
    const div = fo.append("xhtml:div")
      .attr("id", "chart")
      .style("width", "100%")
      .style("height", "550px");
  
    const chartDom = document.getElementById('chart');
    const myChart = echarts.init(chartDom);
  
    const years = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023];
    const evSales = [
      260954, 425345, 585494, 774639,
      1169512, 1603677, 2150882, 3171791,
      4828590, 7234222, 10547126, 16013658,
      22525226, 31406679
    ];
    const chargingPorts = [
      29000, 46000, 82000, 135000,
      195000, 256000, 326000, 422000,
      564000, 756000, 1040000, 1390000,
      1810000, 2100000
    ];
  
    const option = {
      title: {
        text: 'Global EV Sales vs Charging Ports',
        subtext: 'Tracking the growth of electric vehicle sales and charging infrastructure (2010-2023)',
        left: 'center',
        top: 40, 
        textStyle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: '#111'
        },
        subtextStyle: {
          fontSize: 14,
          color: '#666'
        },
        padding: [10, 0, 0, 0] 
      },
      legend: {
        top: 'bottom',           
        left: 'center',          
        orient: 'horizontal',
        textStyle: {
          fontSize: 14
        }
      },
    grid: {
      top: 150, 
      left: 60,
      right: 60,
      bottom: 60
    },

    

      backgroundColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#ffffff' },
        { offset: 1, color: '#f3f6f9' }
      ]),
      tooltip: { trigger: 'axis' },
      legend: { data: ['Global EV Sales', 'Charging Ports'] },
      xAxis: {
        type: 'category',
        data: years,
        axisLabel: { fontWeight: 'bold' }
      },
      yAxis: [
        {
          type: 'value',
          name: 'EV Sales',
          position: 'left',
          axisLabel: { formatter: value => value.toLocaleString() }
        },
        {
          type: 'value',
          name: 'Charging Ports',
          position: 'right',
          axisLabel: { formatter: value => value.toLocaleString() }
        }
      ],
      series: [
        {
          name: 'Global EV Sales',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          data: evSales,
          symbol: 'circle',
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFA726' },
              { offset: 1, color: '#FB8C00' }
            ])
          },
          itemStyle: { color: '#F47B4A' },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: '#F47B4A',
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        },
        {
          name: 'Charging Ports',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: chargingPorts,
          symbol: 'circle',
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#66BB6A' },
              { offset: 1, color: '#2E7D32' }
            ])
          },
          itemStyle: { color: '#2E7D32' },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: '#2E7D32',
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        }
      ],
      animationDuration: 2500,
      animationEasing: 'cubicInOut'
    };
  
    myChart.setOption(option);
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  }
  