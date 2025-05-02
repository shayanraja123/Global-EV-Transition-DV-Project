document.addEventListener('DOMContentLoaded', () => {
    const chartDom = document.getElementById('chart');
    const myChart = echarts.init(chartDom);
  
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
      grid: {
        top: 50,
        left: '3%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
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
          lineStyle: { color: '#eee' }
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
  
    myChart.setOption(option);
  
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  });
  