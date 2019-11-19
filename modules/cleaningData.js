export default {
    remapData,
    getMaterialsPerCountry,
    fromObjectToArray
}

function remapData(rawData) {
    return rawData.map((result) => {
        return {
            materiaal: result.materiaalLabel.value,
            land: result.landLabel.value
        }
    })
}

function getMaterialsPerCountry(accessibleData) {
    const alleMaterialenArray = []
    const alleLandenArray = [...new Set(accessibleData.map(voorwerp => voorwerp.land))]
    const alleLandenMetMaterialenArray = []

    alleLandenArray.map(land => {
        let createObject = new Object()
        accessibleData.filter(voorwerp => {
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

function fromObjectToArray(materialObjectPerCountry) {
    var allarray = []

    materialObjectPerCountry.forEach(land => {

        var obj = {
            key: land.land,
            amount: null,
            materialen: null
        }

        var materialArray = Object.keys(land.materiaalObject).map(function (key) {
            return {
                materiaal: key,
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

        obj.materialen = materialArray
        obj.amount = sum(materialArray).amount

        allarray.push(obj)
    })
    return allarray.sort((a, b) => b.amount - a.amount).splice(0, 10)
}