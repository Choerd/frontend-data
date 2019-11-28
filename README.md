# Frontend-Data
**De opdracht**    
Tijdens het vak Frontend-Data ga ik leren hoe ik een statische visualisatie in D3 om kan toveren tot een interactieve en interessante data visualiate. 

Het is de bedoeling dat je de data ophaalt met een SPARQL Query, deze data vervolgens opschoont en de structuur aanpast om deze vervolgens te kunnen gebruiken in D3. Vervolgens ga je in D3 door middel van een update pattern je visualisatie interactief maken.

## Concept
Wanneer de gebruiker op de website komt ziet hij een overzicht van de landen die voorwerpen hebben binnen een bepaalde categorie, in dit geval Kleding. 

**Interactie**  
`klikken:`
Wanneer de gebruiker op een van de landen klikt spat de bal uiteen en veranderd deze bal in allemaal materialen en kan de gebruiker zien welke materialen er populair waren in dat land.  
`hoveren:` Wanneer de gebruiker over een bal hovered kan hij meer informatie zien. De ballen zijn namelijk een indicatie.

afbeelding hier

> **Doel:** Inzicht geven in waar de voorwerpen uit een bepaalde categorie vandaan komen en van welke materialen deze gemaakt zijn.  
**Doelgroep:** Museumbezoekers die geïnteresseerd zijn in een bepaald land en daarvan willen weten welke materialen daar populair zijn. Dit kan namelijk duidelijk verschillen per land.

## Bubble Chart voorbeeld
afbeekding

**Links gebruikte voorbeelden voor mijn visualisatie:**  
[Bubble Chart](https://www.d3-graph-gallery.com/graph/circularpacking_template.html)  
[Bubble Chart Legenda](https://www.d3-graph-gallery.com/graph/bubble_legend.html)  


## Inhoudsopgave
* [Updaten en opschonen](#Updaten-en-opschonen)
* [API](#API)
* [Features](#Features)
* [Credits](#Credits)

## Updaten en opschonen
In mijn wiki heb ik verschillende stukken geschreven over de code waarmee ik mijn data transformeer en opschoon maar ook over hoe mijn update werkt in d3.

`D3 updaten`
* [D3](https://github.com/Choerd/frontend-data/wiki/D3.js)
* [D3 Update Pattern](https://github.com/Choerd/frontend-data/wiki/D3-Update-Pattern)
* [D3 Update Pattern - Proces](https://github.com/Choerd/frontend-data/wiki/D3-Update-Pattern---Proces)

`JS opschonen`
* [Data Transforming Pattern](https://github.com/Choerd/frontend-data/wiki/Data-Transforming-Pattern)

## API
**Wat haal ik op?**  
Voor mijn visualisatie had ik niet veel data nodig om het een abstracte weergave was van de data. Ik had hiervoor dus geen titels of afbeeldingen nodig. De data die ik heb opgehaald is:
* het soort materiaal van het voorwerp
* de herkomst van het voorwerp

**Wat pas ik aan?**  
De data was best wel schoon toen ik het ophaalde. Het enige wat mij stoorde was dat er soms nutteloze tekst achter het materiaal stond tussen haakjes. Dit is het enige wat ik heb weggehaald.

<details><summary>Mijn SPARQL query</summary>


```
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX gn: <http://www.geonames.org/ontology#> 

SELECT  ?materiaalLabel
	    ?landLabel
WHERE {
<https://hdl.handle.net/20.500.11840/termmaster2705> skos:narrower ?cat . # keuze maken in categorie

  ?cho edm:isRelatedTo ?cat .
  ?cho dct:medium ?materiaal .
  ?cho dct:spatial ?plaats .
  ?plaats skos:exactMatch/wgs84:lat ?lat . 
  ?plaats skos:exactMatch/wgs84:long ?long .
  ?plaats skos:exactMatch/gn:parentCountry ?land .

  ?land gn:name ?landLabel .
  ?materiaal skos:prefLabel ?materiaalLabel .

} ORDER BY DESC(?cho)
```

</details>

## Features
* Wanneer je op een bal klikt van een land, laad hij alle materialen van dat land in. De bal met de meeste materialen is het grootst en heeft de diepste kleur. Deze kleur wordt dynamisch bepaald door de kleur van de bal van het land.
* De waardes in de legenda veranderen dynamisch wanneer je op een bepaalde bal van een bepaald land klikt. De radius van de ballen van de landen zijn ook anders dan die van de voorwerpen.
* De code waarmee ik alle voorwerpen netjes in een array zet vind ik zelf heel netjes gedaan.

## Credits
Hier kun je vinden wie mij heeft geholpen en waarmee dat is geweest.

* Helpen tijdens het experimenteren met het update pattern (**Robert**)
    * Tijdens het schrijven van mijn update functie heeft **Robert** ervoor gezorgt dat hij werkte. Dit was welliswaar op een hackie manier, maar hij nam wel de tijd om met me te gaan zitten.

* Het leren van een General Update Pattern (**Curran Kelleher**)
    * De video van Curran heeft mij heel erg geholpen met het begrijpen van het update pattern en hoort daarom zeker in dit lijstje thuis. **Bron: [Curran Kelleher - The General Update Pattern of D3.js - Video](https://www.youtube.com/watch?v=IyIAR65G-GQ)**

* Het meedenken van de opbouw van balcategorie-functie (**Wessel**)
    * Wessel heeft mij geholpen met het meedenken over de functie waarbij ik mijn ballen in 5 verschillende categorieën verdeel.