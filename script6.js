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

        render(svg, data)

        setTimeout(() => {
            data.pop()
            render(svg, data)
        }, 1000)

        setTimeout(() => {
            data.pop()
            render(svg, data)
        }, 1000)

    })

function render(selection, data) {
    const formaat = d3.scaleLinear()
        .domain(berekenCirkelGrootte(data))
        .range([10, 200])

    const groups = selection.selectAll('g')
        .data(data)
        .enter()
        .append('g')

    const circles = groups.append('circle')
        .attr('class', 'circle')
        .attr("r", (d => formaat(d.amount)))

    selection.selectAll('g').data(data)
        .exit()
        .remove()

    console.log(circles)

    positioneerCirkels(width, height, data, formaat, circles)
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