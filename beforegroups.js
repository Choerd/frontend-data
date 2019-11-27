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
    })

function render(selection, data) {
    const formaat = d3.scaleLinear()
        .domain(berekenCirkelGrootte(data))
        .range([10, 200])

    const alleLanden = [...new Set(data.map(naam => naam.key))]
    const kleur = d3.scaleOrdinal()
        .domain(alleLanden)
        .range(d3.schemeCategory10)

    // circles
    const circles = selection.selectAll('circle')
        .data(data)
    circles
        .enter().append('circle')
            .attr('class', 'circle')
            .attr("fill", (d => kleur(d.key)))
            .on('click', d => render(svg, d.materialen))
            
        .merge(circles)
            .attr("r", (d => formaat(d.amount)))

    circles
        .exit().remove()

    //text
    const text = selection.selectAll('text')
        .data(data)
    //enter
    text
        .enter().append('text')
        .text(d => d.key)
        .attr("class", "text")
        // update
        .merge(text)
        .attr("r", (d => formaat(d.amount)))
    // exit
    text
        .exit().remove()

    const allCircles = selection.selectAll('circle')
    const allText = selection.selectAll('text')
    positioneerCirkels(width, height, data, formaat, allCircles, allText)
}

/* Ondersteunende functies
 * positioneerCirkels
 * berekenCirkelGrootte
 */
function positioneerCirkels(width, height, data, formaat, circles, text) {
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
            text
                .attr("dx", (d => d.x))
                .attr("dy", (d => d.y))
        })
}

function berekenCirkelGrootte(data) {
    const laagsteWaarde = Math.min.apply(Math, data.map(laagste => laagste.amount))
    const hoogsteWaarde = Math.max.apply(Math, data.map(hoogste => hoogste.amount))
    return [laagsteWaarde, hoogsteWaarde]
}