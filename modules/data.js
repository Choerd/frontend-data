const endpoint =
  "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-24/sparql"

const categorie = ["2705", "2809", "2657", "2649"]
//Andere termmasters:
//termmaster2705 = Materialen in de categorie "Kleding"
//termmaster2809 = Materialen in de categorie "Jacht"
//termmaster2657 = Materialen in de categorie "Kunst"
//termmaster2649 = Materialen in de categorie "Levenscyclus"

const sparql = `
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX gn: <http://www.geonames.org/ontology#> 

SELECT  ?materiaalLabel
		    ?landLabel
WHERE {
<https://hdl.handle.net/20.500.11840/termmaster` + categorie[0] + `> skos:narrower ?cat . # keuze maken in categorie

  ?cho edm:isRelatedTo ?cat .
  ?cho dct:medium ?materiaal .
  ?cho dct:spatial ?plaats .
  ?plaats skos:exactMatch/wgs84:lat ?lat . 
  ?plaats skos:exactMatch/wgs84:long ?long .
  ?plaats skos:exactMatch/gn:parentCountry ?land .

  ?land gn:name ?landLabel .
  ?materiaal skos:prefLabel ?materiaalLabel .

} ORDER BY DESC(?cho)
`

export default async function fetchData() {
  const response = await fetch(endpoint + "?query=" + encodeURIComponent(sparql) + "&format=json")
  const data = await response.json()

  return data.results.bindings
}