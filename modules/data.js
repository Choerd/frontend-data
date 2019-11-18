const endpoint =
  "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-24/sparql"

const categorie = ["2705", "2809", "2657", "2649"]
//Andere termmasters:
//termmaster2705 = Materialen in de categorie "Kleding"
//termmaster2809 = Materialen in de categorie "Jacht"
//termmaster2657 = Materialen in de categorie "Kunst"
//termmaster2649 = Materialen in de categorie "Levenscyclus"

const sparql = `
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX gn: <http://www.geonames.org/ontology#> 

SELECT  ?cho
        ?catName
		    ?title
		    ?materiaalLabel
		    ?voorwerpType
		    ?landLabel
WHERE {
<https://hdl.handle.net/20.500.11840/termmaster` + categorie[0] + `> skos:narrower ?cat . # keuze maken in categorie

  # variabelen definiëren
  ?cho edm:isRelatedTo ?cat . # ophalen van de link/uri van het voorwerp
  ?cho dct:medium ?materiaal . # ophalen van het materiaal van het voorwerp
  ?cho dc:type ?voorwerpType . # ophalen van het type van het voorwerp
  ?cho dct:spatial ?plaats .

  ?plaats skos:exactMatch/wgs84:lat ?lat . #
  ?plaats skos:exactMatch/wgs84:long ?long .
  ?plaats skos:exactMatch/gn:parentCountry ?land .

  #Weergeven van de URI's in tekst
  ?cho dc:title ?title . # titel van het voorwerp
  ?cat skos:prefLabel ?catName .
  ?land gn:name ?landLabel .
  ?materiaal skos:prefLabel ?materiaalLabel .

} ORDER BY DESC(?cho)
`

export default async function fetchData() {
  const response = await fetch(endpoint + "?query=" + encodeURIComponent(sparql) + "&format=json")
  const data = await response.json()

  return data.results.bindings
}