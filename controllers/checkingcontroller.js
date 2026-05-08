const db = require('../db/connection');


const checkingController = (req, res) => {
    res.json({
        message: "hellow world",
    })
}

module.exports = { checkingController}