const express = require("express");
const router = new express.Router();
const db = require("../db");


router.get("", async function(req, res, next){
    try {

        result = await db.query(
            `SELECT code, name
             FROM companies`
        );
        
        return res.json(result.rows);

    } catch (err) {
        return next(err);
    }
})

module.exports = router;