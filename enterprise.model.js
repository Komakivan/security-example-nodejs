const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");


const rawData = []

function getData() {
    return new Promise((resolve,reject) => {
        fs.createReadStream(path.join(__dirname,'data','Scrape.csv'))
        .pipe(parse({
            columns: true
        }))
        .on('data',(data) => {
            rawData.push(data)
            // console.log(data)
        })
        .on('error',(err) => {
            console.error(err)
            reject()
        })
        .on('end',() => {
            console.log('data processed...')
            resolve()
        })
    })
}



module.exports = {
  getData,
  rawData
};
