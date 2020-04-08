import fetchData from './modules/data.js'
import functie from './modules/cleaningData.js'

const dataVisContainer = document.querySelector(".datavis-container")
const width = dataVisContainer.clientWidth
const height = dataVisContainer.clientHeight
const svg = d3.select('svg')
    .attr("width", width)
    .attr("height", height)

let zoomed = true, zoomedCircleColor, origineleData, circleSizes, laagsteWaarde, hoogsteWaarde, zoomedLand

fetchData()
    .then(rawData => functie.remapData(rawData))
    .then(remappedData => functie.cleanData(remappedData))
    .then(accessibleData => functie.getMaterialsPerCountry(accessibleData))
    .then(materialObjectPerLand => functie.fromObjectToArray(materialObjectPerLand))
    .then(data => {
        origineleData = data

        render(svg, data) 
    })

function render(selection, data) {
    const materialArray = data
    zoomed = !zoomed

    if (zoomed) {
        circleSizes = [15, 30, 45, 60, 75]
    } else if (!zoomed) {
        circleSizes = [30, 60, 90, 120, 150]
    }

    const formaat = d3.scaleLinear()
        .domain(kleinsteEnGrootsteCircle(data))
        .range([circleSizes[0], circleSizes[4]])

    const kleur = bepaalCircleKleur(data)

    const tooltip = d3.select('#datavis')
        .append('div')
        .attr('class', 'tooltip')
    
    const circlecontainer = d3.select('.circle-container')

    const groups = circlecontainer.selectAll('g')
        .data(data)

    const groupsEnter = groups.enter().append('g')
    groupsEnter
        .merge(groups)
        .on('mouseover', function () {
            tooltip
                .style('opacity', 1)
        })
        .on('mousemove', function (d) {
            tooltip
                .style("left", (d3.mouse(this)[0] + 'px'))
                .style("top", (d3.mouse(this)[1] + -40 + 'px'))
            if (!zoomed) {
                tooltip
                    .html(d.amount + " voorwerpen uit " + "<strong>" + d.key + "</strong")
            } else if (zoomed) {
                tooltip
                    .html(d.amount + " voorwerpen van " + "<strong>" + d.key + "</strong")
                }
        })
        .on('mouseleave', function () {
            tooltip
                .style('left', -9999 + 'px')
        })
    groups.exit().remove()

    groupsEnter
        .append('circle')
            .attr('class', 'circle')
            .attr('id', (d => d.key))
            .on('click', function (object) {
                d3.select('.tooltip').remove()
                d3.select('.legenda').remove()
                if (!zoomed) {
                    zoomedCircleColor = this.getAttribute('fill')
                    zoomedLand = this.id
                    render(svg, object.materialen)
                } else if (zoomed) {
                    render(svg, origineleData)
                }
            })
        .merge(groups.select('circle'))
            .transition().duration(3500)
            .attr("r", (d => categorieCircleSize(d, materialArray)))
            .attr("fill", (d => kleur(d.amount)))

    groupsEnter.append('text')
            .attr('class', 'text')
        .merge(groups.select('text'))
            .text(function (data) {
                if (data.amount >= (hoogsteWaarde / 5) * 1) {
                    return data.key
                }
            })

    const allCircles = selection.selectAll('circle')
    const allText = selection.selectAll('text')
    positioneerCirkels(width, height, data, formaat, allCircles, allText)

    createLegenda(data)
    createHeader()
}

/* Ondersteunende functies
 * positioneerCirkels
 * kleinsteEnGrootsteCircle
 * bepaalCircleKleur
 * categorieCircleSize
 * createLegenda
 */

 // Deze functie heb ik overgenomen van mijn voorbeeld en gedeeltelijk aangepast
function positioneerCirkels(width, height, data, formaat, circles, text) {
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2 - 20).y(height / 2))
        .force("charge", d3.forceManyBody().strength(1))
        .force("collide", d3.forceCollide().strength(.1).radius(d => (formaat(d.amount) + 3)).iterations(.1))

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
    laagsteWaarde = Math.min.apply(Math, data.map(laagste => laagste.amount))
    hoogsteWaarde = Math.max.apply(Math, data.map(hoogste => hoogste.amount))
    return [laagsteWaarde, hoogsteWaarde]
}

function bepaalCircleKleur(data) {
    if (!zoomed) {
        const alleLanden = [...new Set(data.map(naam => naam.key))]
        return d3.scaleOrdinal()
            .domain(alleLanden)
            .range(d3.schemeCategory10)
    } else if (zoomed) {
        console.log(kleinsteEnGrootsteCircle(data))

        return d3.scaleLinear()
            .domain(kleinsteEnGrootsteCircle(data))
            .range(['white', zoomedCircleColor])
    }
}

function categorieCircleSize(data, materialArray) {
    const hoogsteWaarde = kleinsteEnGrootsteCircle(materialArray)[1]

    if (data.amount < (hoogsteWaarde / 5)) {
        return circleSizes[0]
    } else if (data.amount >= (hoogsteWaarde / 5) && data.amount < (hoogsteWaarde / 5) * 2) {
        return circleSizes[1]
    } else if (data.amount >= (hoogsteWaarde / 5) * 2 && data.amount < (hoogsteWaarde / 5) * 3) {
        return circleSizes[2]
    } else if (data.amount >= (hoogsteWaarde / 5) * 3 && data.amount < (hoogsteWaarde / 5) * 4) {
        return circleSizes[3]
    } else if (data.amount >= (hoogsteWaarde / 5) * 4) {
        return circleSizes[4]
    }
}

// Grotendeels overgenomen van het voorbeeld
function createLegenda(data) {
    const xCircle = 1350
    const yCircle = 350
    const xLabel = xCircle + 200

    const size = d3.scaleSqrt()
    .domain(circleSizes)
    .range(circleSizes)

    const circleCategorieArray = []
    const maxMaterialAmount = kleinsteEnGrootsteCircle(data)[1]
    circleCategorieArray.push("< " + Math.round(maxMaterialAmount / 5), Math.round(maxMaterialAmount / 5) + " - " + Math.round(maxMaterialAmount / 5 * 2), Math.round(maxMaterialAmount / 5) * 2 + " - " + Math.round(maxMaterialAmount / 5 * 3), Math.round(maxMaterialAmount / 5) * 3 + " - " + Math.round(maxMaterialAmount / 5 * 4), Math.round(maxMaterialAmount))

    d3.select('svg').append('g')
    .attr('class', 'legenda')

    const legenda = d3.select('.legenda')
    legenda
        .selectAll('legend')
        .data(circleSizes)
        .enter().append('circle')
            .attr("cx", xCircle)
            .attr("cy", d => yCircle - size(d))
            .attr("r", d => size(d))

    legenda
        .selectAll('legend')
        .data(circleSizes)
        .enter().append('line')
            .attr('x1', d => xCircle + size(d))
            .attr('x2', xLabel)
            .attr('y1', d => yCircle - size(d))
            .attr('y2', d => yCircle - size(d))
            .attr('class', 'legenda-circle')

    legenda
        .selectAll('legend')
        .data(circleSizes)
        .enter().append('text')
            .attr('x', xLabel)
            .attr('y', d => yCircle - size(d))
            .data(circleCategorieArray)
            .text(d => d)
            .attr('class', 'legenda-text')

    legenda.append('text')
        .attr('x', xCircle)
        .attr("y", yCircle + 25)
        .text("Aantal voorwerpen")
        .attr('class', 'legenda-title')
}

function createHeader() {
    if (zoomed) {
        document.querySelector('.info span').textContent = zoomedLand + "?"
        document.querySelector('.info span').style.color = zoomedCircleColor
    } else if (!zoomed) {
        document.querySelector('.info span').textContent = "de verschillende landen?"
        document.querySelector('.info span').style.color = 'unset'
    }
}