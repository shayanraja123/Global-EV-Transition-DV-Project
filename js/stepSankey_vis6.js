let dataset = null

function drawSankeyEVPolicies() {
	console.log('drawSankey Policies')
	const margin = {top: 200, bottom: 100, left: 200, right: 20}
    const width = 1400 - margin.left - margin.right
    const height = 800 - margin.top - margin.bottom

    const svg = d3.select('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
		.attr('viewBox', null)
        .append('g')
        	.attr('transform', `translate(${margin.left}, ${margin.top})`)
	
	// early years = '2009-2014'
	// middle = '2015-2017'
	// late = '2018-2021'
	// present = '2022-2024

	const phases = ['early', 'middle', 'late', 'present', '2024']
	let myDict = {
		early: {},
		middle: {},
		late: {},
		present: {}
	}
	
	// making a policies dict where it counts all the different policies
	const yearPoliciesDict = dataset.reduce((updatedDict, obj) => {
		if (obj.year <= 2014) {
			updatedDict['early'][obj.policyStage] = (updatedDict['early'][obj.policyStage] || 0) + 1
		} else if (obj.year <= 2017) {
			updatedDict['middle'][obj.policyStage] = (updatedDict['middle'][obj.policyStage] || 0) + 1
		} else if (obj.year <= 2021) {
			updatedDict['late'][obj.policyStage] = (updatedDict['late'][obj.policyStage] || 0) + 1
		} else {
			updatedDict['present'][obj.policyStage] = (updatedDict['present'][obj.policyStage] || 0) + 1
		}
		return updatedDict
	}, myDict)

	// // for sankey link normalization
	// const yearPhaseTotals = {}
	// let grandTotal = 0
	// for (const key in yearPoliciesDict) {
	// 	const obj = yearPoliciesDict[key]
	// 	yearPhaseTotals[key] = d3.sum(Object.values(obj))
	// 	grandTotal += yearPhaseTotals[key]
	// }

	// const phaseWeight = {}
	// for (const phase of phases) {
	// 	phaseWeight[phase] = yearPhaseTotals[phase] / grandTotal
	// }
	// console.log('hello', yearPhaseTotals)

	let data = {'nodes': [], 'links': []}
	const policyNames = ['Early EV R&D', 'ZEV Mandates', 'ICE Bans', 'Tax Credits', 'EV Grants', 'Direct Subsidies', 'Infrastructure Spending', 'Net-Zero Regulations', 'Unclear / Needs Review']


	// making graph nodes
	

	for (const policy of policyNames) {
		for (const phase of phases) {
			if (policy !== 'Unclear / Needs Review')
				data.nodes.push({name: `${policy}_${phase}`, category: policy})
		}
	}

	phases.forEach(phase => {
		data.nodes.push({name: `Phase_${phase}`})
	})

	console.log(data.nodes)

	for (const obj of data.nodes) {
		const currentKey = obj.name
		let [policy, phase] = currentKey.split('_')
		
		const currentPhaseIndex = phases.indexOf(phase)

		if (policy === 'Phase' || currentPhaseIndex === phases.length - 1) {
			continue
		}

		const nextPhase = phases[currentPhaseIndex + 1]
		const nextKey = `${policy}_${nextPhase}`

		const match = data.nodes.find(obj => obj.name === nextKey)

		if (match) {
			const value = yearPoliciesDict[phase]?.[policy] || 0
			data.links.push({
				'source': currentKey,
				'target': `Phase_${nextPhase}`,
				'value': value
			})
			data.links.push({
				'source': `Phase_${nextPhase}`,
				'target': nextKey,
				'value': 0
			})
		}
	}

	console.log(data.links)

	//make sankey
	const sankey = d3.sankey()
		.nodeId(d => d.name)
		.nodeAlign(d3.sankeyJustify)
		.nodeWidth(15)
		.nodePadding(10)
		.size([width, height])

	const {nodes, links} = sankey({
		nodes: data.nodes.map(d => Object.assign({}, d)),
		links: data.links.map(d => Object.assign({}, d))
	})

	const color = d3.scaleOrdinal()
		.domain(nodes)
		.range(d3.schemeCategory10)

	// make svg nodes
	const rect = svg.append('g')
		.attr('stroke', '#000')
		.selectAll('g')
		.data(nodes, d => d.name)
		.join(
			enter => {
				const g = enter.append('g')
					.attr('class', 'node')
				g.append('rect')
					.attr("x", d => d.x0)
					.attr("y", d => d.y0)
					.attr("height", d => d.y1 - d.y0)
					.attr("width", d => d.x1 - d.x0)
					.attr("fill", d => color(d.category))
				g.append('text')
					.attr('x', d => d.name.includes('Phase') || d.name.includes('2024') ? d.x1 + 52 : d.x0 - 6)
					.attr('y', d => (d.y1 + d.y0)/2)
					.attr('dy', '0.35em')
					.attr('text-anchor', 'end')
					.attr('font-size', '12px')
					.attr('font-weight', 300)
					.text(d => {
						const [name, phase] = d.name.split('_')
						if (d.value === 0) {
							return null
						} else if (name === 'Phase' || phase === '2024') {
							return `Total: ${d.value}`
						}
						else {
							return name
						}
					})
				g.append('text')
					.attr('x', d => d.x0-20)
					.attr('y', -50)//d.name.includes('Phase') && d.name.includes('middlelate') ? (d.y1 + d.y0)/2 + 60 : (d.y1 + d.y0)/2 + 500)
					.attr('dy', '0.35em')
					.attr('text-anchor', 'end')
					.attr('font-size', '20px')
					
					.text(d => {
						const [name, phase] = d.name.split('_')
							// early years = '2009-2014'
						if (name === 'Phase') {
							// it's messed up cuz of how i did the naming for the target node
							if (phase === 'middle') {
								return 'Year 2009-2014'
							} else if (phase === 'late') {
								return 'Year 2015-2017'
							} else if (phase === 'present') {
								return 'Year 2018-2021'
							} else if (phase === '2024'){
								return 'Year 2022-2024'
							} else {
								return null
							}	
						} else {
							return null
						}
					})
					
				return g
			},
			update => update.select('rect')
				.attr("x", d => d.x0)
				.attr("y", d => d.y0)
				.attr("height", d => d.y1 - d.y0)
				.attr("width", d => d.x1 - d.x0)
				.attr("fill", d => color(d.category)),
			exit => exit.remove()
		)
	
	const link = svg.append('g')
		.attr('fill', 'none')
		.attr('stroke-opacity', 0.5)
		.selectAll('path')
		.data(links)
		.join(
			enter => enter.append('path')
				.attr('class', 'link')
				.attr('d', d3.sankeyLinkHorizontal())
				.attr('stroke', d => color(d.source.category))
				.attr('stroke-width', d => d.width)
				.append('title')
				.text(d => `${d.source.name.split('_')[0]}\nValue = ${d.value}`),
			update => update
				.attr('d', d3.sankeyLinkHorizontal())
				.attr('stroke-width', d => d.width),
			exit => exit.remove()
		)

	svg.append('g')
		.selectAll('.title')
		.data(['Flow of Significant EV Policies Over Time'])
		.join(
			enter => enter.append('text')
				.attr('class', 'title')
				.attr('x', 300)
				.attr('y', -125)
				.attr('font-size', '24px')
				.style('font-weight', 700)
				.text(d => d)
		)
	
}

export function createStepSankey() {
    
    d3.csv('data/ev_policy_classified_4.csv').then(function(data) {
        console.log('beep', data)

        dataset = data.map((obj, i) => ({
            ...obj,
            id: i,
            year: Number(obj.year)
        }))
        
        dataset = dataset.filter((obj) => obj.year !== 0)
        console.log(dataset)

        const sumAllPolicies = dataset.reduce((count, obj) => {
            count[obj.policyStage] = (count[obj.policyStage] || 0) + 1
            return count
        }, {})

        console.log(sumAllPolicies)
		drawSankeyEVPolicies()
        
    })

    
}