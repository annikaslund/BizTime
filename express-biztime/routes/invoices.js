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

// get an invoices. Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}} or error
router.get("/:id", async function(req, res, next){
    try {
        // TODO: JOIN tables to try and save lines
        let invoiceRes = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, comp_code
             FROM invoices 
             WHERE id = $1`, 
             [req.params.id]
        );

        if (invoiceRes.rows.length===0) {
            throw new ExpressError("Invalid invoice id.", 404);
        }
        let companyRes = await db.query(`
                                    SELECT code, name, description 
                                    FROM companies 
                                    WHERE code = $1`, 
                                    [invoiceRes.rows[0].comp_code]);
        
        let { comp_code, ...invoice } = invoiceRes.rows[0];

        invoice.company = companyRes.rows[0];

        return res.json({"invoice": invoice});

    } catch (err) {
        return next(err);
    }
})

// post an invoice. Returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}} or error
router.post("", async function(req, res, next) {
    try {
        const { amt, comp_code } = req.body;

        try {
            let response = await db.query(`INSERT INTO invoices (amt, comp_code)
                                        VALUES ($1, $2)
                                        RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
                                        [amt, comp_code])

            return res.json({invoice: response.rows[0]})

        } catch (err) {
            if (err.message.includes("foreign key constraint")) {
                throw new ExpressError("Company does not exist!", 404);
            }
        }


    } catch (err) {
        return next(err);
    }
})



module.exports = router;