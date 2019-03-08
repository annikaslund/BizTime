const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

// get all companies. Returns {companies: [{code, name}, ...]} or error
router.get("", async function(req, res, next){
    try {

        let result = await db.query(
            `SELECT code, name
             FROM companies`
        );
        
        return res.json({"companies": result.rows});

    } catch (err) {
        return next(err);
    }
})

// get information on a specific company code passed in as param
// returns {company: {code, name, description}} or error
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

        return res.json({"company": result.rows[0]});

    } catch(err){

        return next(err);
    }
})

// enter in new company into database
// Returns obj of new company: {company: {code, name, description}} 
// or error
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

        return res.json({"company": result.rows[0]});

    } catch (err) {
        return next(err);
    }
})

// update company in database via PUT request
// Returns obj of existing company: {company: {code, name, description}} 
// or error
router.put("/:code", async function(req, res, next){
    try {
        const { code, name, description } = req.body;

        let result = await db.query(
            `UPDATE companies SET code = $1, name = $2, description =$3 WHERE code = $4
            RETURNING code, name, description`,
            [code, name, description, req.params.code]
            );

        if (result.rows.length === 0){
            throw new ExpressError("Company does not exist.", 404);
        }

        return res.json({"company": result.rows[0]});

    } catch (err) {
        return next(err);
    }
})

// delete specified company in database.
router.delete("/:code", async function(req, res, next){
    try {
        let code = req.params.code;

        let response = await db.query(`
            DELETE FROM companies 
            WHERE code=$1
            RETURNING code`,
            [code]
        );

        if (response.rows.length === 0){
            throw new ExpressError("Company does not exist!", 404);
        }

        return res.json({status: "deleted"});
    
    } catch(err){

        return next(err);
    }
})

module.exports = router;

