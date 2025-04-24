

document.addEventListener('DOMContentLoaded', function () {

    d3.csv('dan-data/charging_ports_database.csv').then(function(data) {
        console.log('loaded data')

        world_data = data.filter(obj => obj['Geo Zone'] === 'World')
                         .filter(obj => obj['Scenario Type'] === 'IEA-APS' || obj['Scenario Type'] === 'REAL')
        console.log(world_data)
        // console.log('beep', data)

        // dataset = data.map((obj, i) => ({
        //     ...obj,
        //     id: i,
        //     year: Number(obj.year)
        // }))
        
        // dataset = dataset.filter((obj) => obj.year !== 0)
        // console.log(dataset)

        // const sumOtherUnclassified = dataset.reduce((count, obj) => {
        //     count[obj.policyStage] = (count[obj.policyStage] || 0) + 1
        //     return count
        // }, {})

        // console.log(sumOtherUnclassified)
		// drawSankeyEVPolicies()
        
    })

    
})