const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

// get all invoices. Returns {invoices: [{id, comp_code}, ...]} or error
router.get("", async function(req, res, next){
    try {

        let result = await db.query(
            `SELECT id, comp_code
             FROM invoices`
        );
        
        return res.json({"invoices": result.rows});

    } catch (err) {
        return next(err);
    }
})


module.exports = router;