export default {
    fixReadability,
    materialenVoorElkLand,
    top5MaterialenPerLand,
    landenMet5VerschillendeMaterialen,
    totaalAantalMaterialenPerLand,
    arrayToObject
}

export function fixReadability(data) {
    return data.map((result) => {
        return {
            materiaal: result.materiaalLabel.value,
            land: result.landLabel.value
        }
    })
}

export function materialenVoorElkLand(readableData) {
    const alleMaterialenArray = []
    const alleLandenArray = [...new Set(readableData.map(voorwerp => voorwerp.land))]
    const alleLandenMetMaterialenArray = []

    alleLandenArray.map(land => {
        let createObject = new Object()
        readableData.filter(voorwerp => {
            if (voorwerp.land.includes(land)) {
                alleMaterialenArray.push(createObject = {
                    land: land,
                    materiaal: voorwerp.materiaal,
                })
            }
        })
    })

    alleLandenArray.map(land => {
        let maakNieuwObject = new Object()
        alleMaterialenArray.filter(data => {
            if (data.land === land) {
                if (maakNieuwObject[data.materiaal] != null) {
                    maakNieuwObject[data.materiaal] += 1
                } else {
                    maakNieuwObject[data.materiaal] = 1
                }
            }
        })
        alleLandenMetMaterialenArray.push({
            materiaalObject: maakNieuwObject,
            land: land,
        })
    })
    return alleLandenMetMaterialenArray
}

export function top5MaterialenPerLand(materialenPerLand) {
    const array = []

    materialenPerLand.map(land => {
        const landVoorArray = []
        Object.keys(land.materiaalObject).forEach(key => {
            let createObject = new Object()
            createObject = {
                materiaal: key,
                aantal: land.materiaalObject[key],
                land: land.land
            }
            landVoorArray.push(createObject)
        })
        landVoorArray.sort(function (a, b) {
            return b.aantal - a.aantal
        })
        array.push(landVoorArray.splice(landVoorArray, 5))
    })
    return array
}

export function landenMet5VerschillendeMaterialen(top5MeesteMaterialenPerLand) {
    return top5MeesteMaterialenPerLand.filter(array => {
        if (array.length == 5) {
            return array
        }
    })
}

export function totaalAantalMaterialenPerLand(totaalMaterialenPerLand) {
    const dataArray = []
    totaalMaterialenPerLand.map(land => {
        let createObject = new Object()
        land.forEach(land => {
            createObject = {
                totaal: land.aantal + land.aantal + land.aantal + land.aantal + land.aantal
            }
        });
        land.push(createObject)
        dataArray.push(land)
    });
    return dataArray
}

export function arrayToObject(top5MaterialenTop5Landen) {
    top5MaterialenTop5Landen.sort((a, b) => b[5].totaal - a[5].totaal).splice(5, top5MaterialenTop5Landen.length)

    const rawDataArray = []
    top5MaterialenTop5Landen.map(array => {
        array.map(object => {
            let createObject = new Object()
            createObject = {
                land: object.land,
                aantal: object.aantal,
                materiaal: object.materiaal
            }
            rawDataArray.push(createObject)
        })
    })

    const cleanDataArray = []
    rawDataArray.forEach(object => {
        if (object.aantal != undefined) {
            cleanDataArray.push(object)
        }
    })
    return cleanDataArray
}