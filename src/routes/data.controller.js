const {rawData} = require('../../enterprise.model')

function httpGetData(req, res) {
    res.status(200).json(rawData)
}