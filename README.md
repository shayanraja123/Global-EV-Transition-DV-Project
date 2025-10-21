# Dan-Mohana-Raja-Shivam-Sujay-Syed
# Project Title: The Global EV-olution: Are We There Yet?

This project presents a **scrollytelling-based interactive narrative** that explores the global rise of electric vehicles (EVs), the technologies driving them, the policy incentives accelerating their growth, and the future challenges and opportunities in the space.

Created as part of the **CSE 578: Data Visualization** course at Arizona State University.

## Live Demo

> 💡 _To view the live scrollytelling project, open `index.html` in your latest Google Chrome browser._  
> _Simply double-click the file or right-click → **“Open with Live Server”** in VS Code to launch it locally._  
> _✅ Optimized for **Google Chrome** - use it for the best visual and interactive performance._

## How to Run

1. **Clone or download** this repository to your local machine.
2. Navigate to the root folder.
3. **Open `index.html` in your web browser.**
   - No server or dependencies are required.
   - All scripts and assets are embedded or locally referenced.
  
## Key Visualizations and Features

- **Visualization 2:** A modded line chart where the path resembles a road and data points are marked by car icons.
- **Visualization 5:** A custom bubble chart showing global EV incentives using size, color, and tooltip interactivity.
- **Visualization 10:** An animated radar plot layered over a rotating SVG wind turbine, synchronized with scroll-based year progression.
- **Visualization 12:** A draggable 3D globe (using three.js and D3) that shows projected CO₂ reductions based on EV adoption.

## Tools & Libraries

This project uses:
- [D3.js](https://d3js.org/) – Used for most custom SVG visualizations  
- [Apache ECharts](https://echarts.apache.org/) – Used for dual-axis and radar plots  
- [three.js](https://threejs.org/) – Used for the 3D globe visualization  
- [TopoJSON](https://github.com/topojson/topojson) – For rendering GeoJSON maps  
- [Observable](https://observablehq.com/) – Referenced for chart inspiration and patterns  
- **Vanilla HTML/CSS/JavaScript** – Base technology for layout, styling, and DOM logic

## Datasets

We used 12 datasets corresponding to each visualization. Data was sourced from:

- [Our World in Data](https://ourworldindata.org/)
- [IEA Global EV Policy Explorer](https://www.iea.org/data-and-statistics/data-tools/global-ev-policy-explorer)
- [Harvard Dataverse](https://dataverse.harvard.edu/)
- [UC Davis ITS](https://itspubs.ucdavis.edu/)
- [Zenodo](https://zenodo.org/)
- [Energy Institute Statistical Review](https://www.energyinst.org/statistical-review)
- And several custom CSVs manually created for specific visuals (e.g., cobalt/lithium production, charging growth)

The datasets are stored in CSV or JSON format and directly loaded using `d3.csv()` or `d3.json()` from each corresponding visualization script.

## Notable Implementation Highlights

- **Scroll-triggered storytelling:** Built from scratch without third-party scroll libraries.
- **Modular visualization architecture:** Each `*_visX.js` file corresponds to a specific visualization.
- **Custom transitions and tooltips:** Manually styled using D3's transition API and ECharts' tooltip controls.
- **Responsive visualizations:** SVG sizes are normalized across all visuals for consistent rendering and smooth storytelling.

## Credits

Created by:
  
- Dan Nguyen  
- Mohana Samara Simha Reddy Attunuru
- Raja Muhammad Shayan
- Shivam Patel  
- Sujay Shiva Prakash  
- Syed Wajahath Quadri

Course: **CSE 578: Data Visualization**, Spring 2025  
Instructor: Prof. Chris Bryan, ASU

## License

This project is for academic and educational purposes only.
