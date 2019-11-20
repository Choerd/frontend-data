import fetchData from './modules/data.js'
import functie from './modules/cleaningData.js'

fetchData()
    .then(rawData => functie.remapData(rawData))
    .then(remappedData => functie.cleanData(remappedData))
    .then(accessibleData => functie.getMaterialsPerCountry(accessibleData))
    .then(materialObjectPerCountry => functie.fromObjectToArray(materialObjectPerCountry))
    .then(data => {
        // console.log(data)

        visualizeData(data)

        function visualizeData(data) {
            // Variabelen
            const alleLanden = [...new Set(data.map(naam => naam.key))] // Aanmaken van verschillende categoriën voor bepalen van de kleur
            const dataVisContainer = document.querySelector(".datavis-container")
            const margin = 40
            const width = dataVisContainer.clientWidth
            const height = dataVisContainer.clientHeight

            const svg = d3.select("#datavis")
                .append("svg")
                .attr("width", width - margin)
                .attr("height", height - margin)

            const color = d3.scaleOrdinal()
                .domain(alleLanden)
                .range(d3.schemeCategory10)

            const size = d3.scaleLinear()
                .domain([0, 1500])
                .range([10, 75])

            // Meegeven van data naar alle groepselementen
            const groups = svg.selectAll("g")
                .data(data)

            // Aanmaken van een groep
            const datacircle = groups.enter()
                .append("g")
                .on("mouseover", hoverCircle)
                .on("mouseout", unhoverCircle)

                // Function to update the data
                .on("click", el => {
                    updateData(el, svg)
                })

            // Aanmaken van een circle in de group
            const circle = datacircle.append("circle")
                .attr("class", "circle")
                .attr("r", (d => size(d.amount)))
                .attr("fill", (d => color(d.key)))

            // Aanmaken van text in de group
            const text = datacircle.append("text")
                .text(function (d) {
                    if (d.amount >= 500) {
                        return d.key + " - " + d.amount + " voorwerpen"
                    }
                })
                .attr("class", "text")

            const simulation = d3.forceSimulation()
                .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Plaatsen in het midden
                .force("charge", d3.forceManyBody().strength(.1)) // De kracht waarmee de circels tot elkaar worden aangetrokken (> 0 hoe sterker aangetrokken tot elkaar)
                .force("collide", d3.forceCollide().strength(.2).radius(d => (size(d.amount) + 3)).iterations(1)) //.iterations zorgt ervoor dat dat de circels niet over elkaar heen gaan (> 0) 

            simulation
                .nodes(data)
                .on("tick", function (d) {
                    circle // Plaatsen van circles
                        .attr("cx", (d => d.x))
                        .attr("cy", (d => d.y))
                    text // Plaatsen van text
                        .attr("dx", (d => d.x))
                        .attr("dy", (d => d.y))
                })

            function hoverCircle() {
                this.children[0].classList.add("hover")
                this.children[1].classList.add("hover")
            }

            function unhoverCircle() {
                this.children[0].classList.remove("hover")
                this.children[1].classList.remove("hover")
            }

            // Update data function
            function updateData(context, svg) {
                d3.select('#datavis').select('svg').remove()
                visualizeData(context.materialen);
            }
        }
    })