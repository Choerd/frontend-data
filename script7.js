import fetchData from './modules/data.js'
import functie from './modules/cleaningData.js'

const dataVisContainer = document.querySelector(".datavis-container")
const width = dataVisContainer.clientWidth
const height = dataVisContainer.clientHeight
const svg = d3.select('svg')
    .attr("width", width)
    .attr("height", height)

let zoomed = true
let zoomedCircleColor
let origineleData

fetchData()
    .then(rawData => functie.remapData(rawData))
    .then(remappedData => functie.cleanData(remappedData))
    .then(accessibleData => functie.getMaterialsPerCountry(accessibleData))
    .then(materialObjectPerLand => functie.fromObjectToArray(materialObjectPerLand))
    .then(data => {
        origineleData = data

        console.log(data)

        render(svg, data)
    })

function render(selection, data) {
    zoomed = !(zoomed != false)

    const formaat = d3.scaleLinear()
        .domain(kleinsteEnGrootsteCircle(data))
        .range([10, 200])

    const kleur = bepaalCircleKleur(data)

    const groups = selection.selectAll('g')
        .data(data)

    const groupsEnter = groups.enter().append('g')
    groupsEnter
        .merge(groups)
    groups.exit().remove()

    groupsEnter.append('circle')
        .attr('class', 'circle')
        .attr('id', (d => d.key))
        .on('click', function (object) {
            if (!zoomed) {
                zoomedCircleColor = this.getAttribute('fill')
                render(svg, object.materialen)
            } else if (zoomed) {
                render(svg, origineleData)
            }
        })
        .merge(groups.select('circle'))
        .transition().duration(350)
        .attr("r", (d => formaat(d.amount)))
        .attr("fill", (d => kleur(d.amount)))

    groupsEnter.append('text')
        .attr('class', 'text')

        .merge(groups.select('text'))
        .text(d => generateText(d))

    const allCircles = selection.selectAll('circle')
    const allText = selection.selectAll('text')
    positioneerCirkels(width, height, data, formaat, allCircles, allText)
}

/* Ondersteunende functies
 * positioneerCirkels
 * kleinsteEnGrootsteCircle
 * bepaalCircleKleur
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

function kleinsteEnGrootsteCircle(data) {
    const laagsteWaarde = Math.min.apply(Math, data.map(laagste => laagste.amount))
    const hoogsteWaarde = Math.max.apply(Math, data.map(hoogste => hoogste.amount))
    return [laagsteWaarde, hoogsteWaarde]
}

function generateText(d) {
    // iets doen met de tekst
    // return d.key
}

function bepaalCircleKleur(data) {
    if (!zoomed) {
        const alleLanden = [...new Set(data.map(naam => naam.key))]
        return d3.scaleOrdinal()
            .domain(alleLanden)
            .range(d3.schemeCategory10)
    } else if (zoomed) {
        return d3.scaleLinear()
            .domain(kleinsteEnGrootsteCircle(data))
            .range(['white', zoomedCircleColor])
    }
}
