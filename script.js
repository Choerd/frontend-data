import fetchData from './modules/data.js'
import functie from './modules/cleaningData.js'

fetchData()
    .then(rawData => functie.fixReadability(rawData))
    .then(readableData => functie.materialenVoorElkLand(readableData))
    .then(materialenPerLand => functie.top5MaterialenPerLand(materialenPerLand))
    .then(top5MeesteMaterialenPerLand => functie.landenMet5VerschillendeMaterialen(top5MeesteMaterialenPerLand))
    .then(totaalMaterialenPerLand => functie.totaalAantalMaterialenPerLand(totaalMaterialenPerLand))
    .then(top5MaterialenTop5Landen => functie.arrayToObject(top5MaterialenTop5Landen))
    .then(data => {
        console.log("Gebruikte data in de visualisatie: ", data)

        // Variabelen
        const alleLanden = [...new Set(data.map(naam => naam.land))] // Aanmaken van verschillende categoriën voor bepalen van de kleur
        const dataVisContainer = document.querySelector(".datavis-container")
        const margin = 40
        const width = dataVisContainer.clientWidth
        const height = dataVisContainer.clientHeight

        const svg = d3.select("#datavis")
            .append("svg")
            .attr("width", width - margin)
            .attr("height", height - margin)

        const color = d3.scaleOrdinal()
            .domain(alleLanden) // Alle landen in de array krijgen een eigen kleur
            .range(d3.schemeSet1); // Kleurenschema van d3 gebruikt

        // Size scale for countries
        const size = d3.scaleLinear()
            .domain([0, 1100])
            .range([10, 75]) // Circle will be between 10 and 75 px wide

        // Meegeven van data naar alle groepselementen
        const groups = svg.selectAll("g")
            .data(data)

        // Aanmaken van een groep voor svg attributen
        const datacircle = groups.enter()
            .append("g")

        // Aanmaken van een circle waarin ik:
        // * het aantal van een materiaal weergeef
        // * de kleur van de circle bebaal door het land
        const circle = datacircle.append("circle")
            .attr("class", "circle") // Class meegeven voor stijling
            .attr("r", (d => size(d.aantal))) // Radius word bepaald door aantal uit de data
            .attr("fill", (d => color(d.land)))
            .on("mouseover", (d => (console.log(d))))

        // Aanmaken van tekst de groep met de circle waarin ik:
        // * Cijfers kleiner 100 worden niet weergeven in een circle
        // * De tekst krijgt een locatie mee waar hij moet staan
        const text = datacircle.append("text")
            .text(function (d) {
                if (d.aantal >= 100) {
                    return d.aantal
                }
            })
            .attr("class", "text") // Krijgt class mee voor stijling
            .on("mouseover", (d => (console.log(d)))) // Loggen van de data van gehoverde circle

        const simulation = d3.forceSimulation()
            .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Plaatsen in het midden
            .force("charge", d3.forceManyBody().strength(.1)) // De kracht waarmee de circels tot elkaar worden aangetrokken (> 0 hoe sterker aangetrokken tot elkaar)
            .force("collide", d3.forceCollide().strength(.2).radius(d => (size(d.aantal) + 3)).iterations(1)) //.iterations zorgt ervoor dat dat de circels niet over elkaar heen gaan (> 0) 

        simulation
            .nodes(data)
            .on("tick", function (d) {
                circle // Plaatsen van circles
                    .attr("cx", (d => d.x)) // Plaatsen van de circles op de X-as van de svg
                    .attr("cy", (d => d.y)) // Plaatsen van de circles op de Y-as van de svg
                text // Plaatsen van text
                    .attr("dx", (d => d.x)) // Plaatsen van de text op de X-as van de svg
                    .attr("dy", (d => d.y)) // Plaatsen van de text op de Y-as van de svg
            })
    })