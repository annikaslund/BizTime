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
            `SELECT code, name, description
            FROM companies
            WHERE code=$1`,
            [code]
            );
        
        if(result.rows.length === 0){
            throw new ExpressError("Company not found.", 404);
        };

        return res.json({'company': result.rows[0]});

    } catch(err){

        return next(err);
    }
})

router.post("", async function(req, res, next){
    try {
        const { code, name, description } = req.body;
        if (!name || !code) {
            throw new ExpressError("Company name and code are required.", 422)
        }
        let result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
            );

        return res.json({'company': result.rows[0]});

    } catch (err) {
        return next(err);
    }
})

module.exports = router;