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

        maakCirkels(data)
    })

function maakCirkels(data) {
    const formaat = d3.scaleLinear()
        .domain(berekenCirkelGrootte(data))
        .range([data[9].amount / 20, data[0].amount / 20])

    const alleLanden = [...new Set(data.map(naam => naam.key))]
    const kleur = d3.scaleOrdinal()
        .domain(alleLanden)
        .range(d3.schemeCategory10)

    const svg = d3.select('svg')
        .selectAll('g')
        .data(data)

    const groups = svg.enter()
        .append('g')

    const circle = groups.append('circle')
        .attr('class', 'circle')
        .attr("r", (d => formaat(d.amount)))
        .attr("fill", (d => kleur(d.key)))

        /* Update, exit, remove */


        .on("click", el => updateData(el))


    /* Re-renderen */

    const text = groups.append("text")
        .text(d => {
            if (d.amount >= 500) {
                return d.amount
            }
        })
        .attr("class", "text")

    centerCircles(width, height, data, formaat, circle, text)
}

function updateData(context) {
    const formaat = d3.scaleLinear()
        .domain(berekenCirkelGrootte(context.materialen))
        .range([10, berekenCirkelGrootte(context.materialen)[1] / 4.5])

    const kleur = d3.scaleLinear()
        .domain(berekenCirkelGrootte(context.materialen))
        .range(['white', 'red'])

    const svg = d3.select('svg')
        .selectAll('g')
        .data(context.materialen)

    const groups = svg.enter()
        .append('g')

    const circle = groups.append('circle')
        .attr('class', 'circle')
        .attr("r", (d => formaat(d.amount)))
        .attr('fill', (d => kleur(d.amount)))

    const text = groups.append("text")
        .text(d => d.amount)
        .attr("class", "text")

    centerCircles(width, height, context.materialen, formaat, circle, text)

}

// Ondersteunede functies die ik vaker gebruik in de main code
function centerCircles(width, height, data, formaat, circle, text) {
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(.1))
        .force("collide", d3.forceCollide().strength(.2).radius(d => (formaat(d.amount) + 3)).iterations(1))

    simulation
        .nodes(data)
        .on("tick", function (d) {
            circle
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