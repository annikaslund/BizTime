const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");


router.get("", async function(req, res, next){
    try {

        let result = await db.query(
            `SELECT code, name
             FROM companies`
        );
        
        return res.json(result.rows);

    } catch (err) {
        return next(err);
    }
})

router.get("/:code", async function(req, res, next){
    try {
        let code = req.params.code;
        let result = await db.query(
            `SELECT code
            FROM companies
            WHERE code=$1`,
            [code]
            );
        
        if(result.rows.length === 0){
            throw new ExpressError("Company not found.", 404);
        };

        return res.json(result.rows[0]);

    } catch(err){

        return next(err);
    }
})

// router.post("", async function(req, res, next){
//     try {

//     } catch (err) {

//     }
// })

module.exports = router;