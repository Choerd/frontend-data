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
    .then(materialObjectPerCountry => functie.fromObjectToArray(materialObjectPerCountry))
    .then(data => {
        console.log(data)

        drawCircles(data)
    })

function drawCircles(data) {
    const size = d3.scaleLinear()
        .domain(circleSize(data))
        .range([data[9].amount / 20, data[0].amount / 20])

    const alleLanden = [...new Set(data.map(naam => naam.key))]
    const color = d3.scaleOrdinal()
        .domain(alleLanden)
        .range(d3.schemeCategory10)

    const groups = svg.selectAll('g')
        .data(data)
        .enter()
        .append('g')

    const circle = groups.append('circle')
        .attr('class', 'circle')
        .attr("r", (d => size(d.amount)))
        .attr("fill", (d => color(d.key)))

        .on("click", el => updateData(el))

    const text = groups.append("text")
        .text(function (d) {
            return d.amount
        })
        .attr("class", "text")

    centerCircles(width, height, data, size, circle, text)
}

function updateData(context) {
    const size = d3.scaleLinear()
        .domain(circleSize(context.materialen))
        .range([10, circleSize(context.materialen)[1] / 4.5])

    const color = d3.scaleLinear()
        .domain(circleSize(context.materialen))
        .range(['white', 'blue'])

    svg.selectAll('g')
        .remove()
        .exit()

    const groups = svg.selectAll('g')
        .data(context.materialen)
        .enter()
        .append('g')

    const circle = groups.append('circle')
        .attr('class', 'circle')
        .attr("r", (d => size(d.amount)))
        .attr('fill', (d => color(d.amount)))

    const text = groups.append("text")
        .text(function (d) {
            return d.amount
        })
        .attr("class", "text")

    centerCircles(width, height, context.materialen, size, circle, text)
}

// Ondersteunede functies die ik vaker gebruik in de main code
function centerCircles(width, height, data, size, circle, text) {
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(.1))
        .force("collide", d3.forceCollide().strength(.2).radius(d => (size(d.amount) + 3)).iterations(1))

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

//max min size
function circleSize(data) {
    const leastAmount = Math.min.apply(Math, data.map(lowest => lowest.amount))
    const mostAmount = Math.max.apply(Math, data.map(highest => highest.amount))
    return [leastAmount, mostAmount]
}