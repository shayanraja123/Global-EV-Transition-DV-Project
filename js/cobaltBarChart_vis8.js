export function createLithiumCobaltVis() {
    const container = document.getElementById("vis8-container");
    container.style.display = "block";
  
    const mainVis = document.getElementById("main-vis");
    if (mainVis) mainVis.style.display = "none";

    // Clear any previous chart
    container.innerHTML = "";  // ← Important so we don’t stack charts

    // Create a new div inside the container for ECharts
    const chartDiv = document.createElement("div");
    chartDiv.id = "chart";
    chartDiv.style.width = "1000px";
    chartDiv.style.height = "600px";
    chartDiv.style.display = "flex";
    chartDiv.style.flexDirection = "column";
    chartDiv.style.justifyContent = "center";
    chartDiv.style.alignItems = "center";
    chartDiv.style.marginTop = "75px";
    container.appendChild(chartDiv);
  
    const chart = echarts.init(chartDiv);
  
    const data = [
      { year: 2010, lithium: 24.48, cobalt: 88.72 },
      { year: 2011, lithium: 28.21, cobalt: 95.79 },
      { year: 2012, lithium: 33.57, cobalt: 97.86 },
      { year: 2013, lithium: 35.77, cobalt: 102.65 },
      { year: 2014, lithium: 38.52, cobalt: 109.37 },
      { year: 2015, lithium: 42.94, cobalt: 110.98 },
      { year: 2016, lithium: 51.37, cobalt: 118.32 },
      { year: 2017, lithium: 63.44, cobalt: 136.74 },
      { year: 2018, lithium: 86.78, cobalt: 150.75 },
      { year: 2019, lithium: 95.88, cobalt: 145.23 },
      { year: 2020, lithium: 110.55, cobalt: 142.61 },
      { year: 2021, lithium: 140.91, cobalt: 170.30 },
      { year: 2022, lithium: 179.19, cobalt: 184.87 },
      { year: 2023, lithium: 207.63, cobalt: 193.22 }
    ];
  
    const years = data.map(d => d.year);
    const lithiumData = data.map(d => d.lithium);
    const cobaltData = data.map(d => d.cobalt);
  
    const option = {

      title: {
            text: 'Lithium & Cobalt Production',
            subtext: 'Global total production from 2010 to 2023 (in kilotonnes)',
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 22,
                fontWeight: 'bold',
                color: '#111'
            },
            subtextStyle: {
                fontSize: 14,
                color: '#666'
            }
        },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params) {
          let text = `<strong>${params[0].name}</strong><br/>`;
          params.forEach(item => {
            text += `<span style="color:${item.color}">\u25A0</span> ${item.seriesName}: ${item.value.toLocaleString()} kt<br/>`;
          });
          return text;
        }
      },
      legend: {
        bottom: -5,
        left: 'center',
        itemWidth: 14,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          color: '#333'
        }
      },
      grid: { top: 90, left: '3%', right: '4%', bottom: 40, containLabel: true},
      xAxis: {
        type: 'category',
        data: years,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { color: '#333' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: {
          color: '#333',
          formatter: value => value.toLocaleString()
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#ccc',
            width: 1.0,
            type: 'solid'
            }
        }
      },
      series: [
        {
          name: 'Cobalt',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#F47B4A',
            borderRadius: [4, 4, 0, 0],
            shadowColor: 'rgba(244, 123, 74, 0.3)',
            shadowBlur: 10
          },
          emphasis: { focus: 'series' },
          data: cobaltData
        },
        {
          name: 'Lithium',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#F4A300',
            borderRadius: [4, 4, 0, 0],
            shadowColor: 'rgba(244, 163, 0, 0.3)',
            shadowBlur: 10
          },
          emphasis: { focus: 'series' },
          data: lithiumData
        }
      ],
      animationEasing: 'cubicOut',
      animationDuration: 1600
    };
  
    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }