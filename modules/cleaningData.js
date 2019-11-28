export default {
    remapData,
    getMaterialsPerCountry,
    fromObjectToArray,
    cleanData
}

function remapData(rawData) {
    return rawData.map((result) => {
        return {
            materiaal: result.materiaalLabel.value,
            land: result.landLabel.value
        }
    })
}

function cleanData(remappedData) {
    return remappedData.map(datapiece => {
        if (datapiece.materiaal.includes("(")) {
            return {
                materiaal: datapiece.materiaal.split(" ")[0],
                land: datapiece.land
            }
        } else {
            return {
                materiaal: datapiece.materiaal,
                land: datapiece.land
            }
        }
    })
}

function getMaterialsPerCountry(accessibleData) {
    const alleLandenArray = [...new Set(accessibleData.map(voorwerp => voorwerp.land))]
    const alleLandenMetMaterialenArray = []

    alleLandenArray.map(land => {
        let obj = new Object()
        accessibleData.map(data => {
            if (data.land === land) {
                if (obj[data.materiaal] != null) {
                    obj[data.materiaal] += 1
                } else {
                    obj[data.materiaal] = 1
                }
            }
        })

        alleLandenMetMaterialenArray.push({
            materiaalObject: obj,
            land: land,
        })
    })
    return alleLandenMetMaterialenArray
}

function fromObjectToArray(materialObjectPerCountry) {
    var nestedDataArray = []

    materialObjectPerCountry.forEach(land => {
        var obj = {
            key: land.land,
            amount: null,
            materialen: null
        }

        var materiaalArray = Object.keys(land.materiaalObject).map(function (key) {
            return {
                key: key,
                amount: land.materiaalObject[key]
            }
        })

        function sum(materialArray) {
            return materialArray.reduce((a, b) => {
                return {
                    amount: a.amount + b.amount
                }
            })
        }

        obj.materialen = materiaalArray
        obj.amount = sum(materiaalArray).amount

        nestedDataArray.push(obj)
    })
    return nestedDataArray.sort((a, b) => b.amount - a.amount).splice(0, 10)
}