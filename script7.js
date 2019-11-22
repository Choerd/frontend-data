import fetchData from './modules/data.js'
import functie from './modules/cleaningData.js'

const dataVisContainer = document.querySelector(".datavis-container")
const width = dataVisContainer.clientWidth
const height = dataVisContainer.clientHeight
const svg = d3.select('svg')
    .attr("width", width)
    .attr("height", height)

fetchData()
    .then(rawData => functie.remapData(rawData))
    .then(remappedData => functie.cleanData(remappedData))
    .then(accessibleData => functie.getMaterialsPerCountry(accessibleData))
    .then(materialObjectPerLand => functie.fromObjectToArray(materialObjectPerLand))
    .then(data => {
        console.log(data)

        render(svg, data)

        // setTimeout(() => {
        //     data[9].amount = 1300
        //     render(svg, data)
        // }, 1000)

        // setTimeout(() => {
        //     data[6].amount = 1600
        //     render(svg, data)
        // }, 2000)
    })

function render(selection, data) {
    const formaat = d3.scaleLinear()
        .domain(berekenCirkelGrootte(data))
        .range([10, 200])

    const alleLanden = [...new Set(data.map(naam => naam.key))]
    const kleur = d3.scaleOrdinal()
        .domain(alleLanden)
        .range(d3.schemeCategory10)

    const circles = selection.selectAll('circle')
        .data(data)

    circles
        .attr("r", (d => formaat(d.amount)))

    circles
        .enter().append('circle')
        .attr('class', 'circle')
        .attr("r", (d => Math.sqrt(formaat(d.amount))))
        .attr("fill", (d => kleur(d.key)))
        .on('click', d => render(svg, d.materialen))

    circles
        .exit().remove()

    const allCircles = selection.selectAll('circle')
    positioneerCirkels(width, height, data, formaat, allCircles)
}

/* Ondersteunende functies
 * positioneerCirkels
 * berekenCirkelGrootte
 */
function positioneerCirkels(width, height, data, formaat, circles) {
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(.1))
        .force("collide", d3.forceCollide().strength(.2).radius(d => (formaat(d.amount) + 3)).iterations(1))

    simulation
        .nodes(data)
        .on("tick", function (d) {
            circles
                .attr("cx", (d => d.x))
                .attr("cy", (d => d.y))
        })
}

function berekenCirkelGrootte(data) {
    const laagsteWaarde = Math.min.apply(Math, data.map(laagste => laagste.amount))
    const hoogsteWaarde = Math.max.apply(Math, data.map(hoogste => hoogste.amount))
    return [laagsteWaarde, hoogsteWaarde]
}