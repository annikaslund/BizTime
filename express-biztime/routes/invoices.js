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

// update invoice in database via PUT request
// Returns obj of existing invoice: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
// or error
router.put("/:id", async function(req, res, next){
    try {
        const amt = req.body.amt;

        // if passed not a number in amount, throws error
        // if(typeof Number(amt) !== "number"){
        //     throw new ExpressError("Amount is not a valid number.", 422);
        // }

        const id = req.params.id;

        let result = await db.query(
            `UPDATE invoices SET amt=$1 
             WHERE id=$2
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, id]
            );

        if (result.rows.length === 0){
            throw new ExpressError("Invoice does not exist.", 404);
        }

        return res.json({"invoice": result.rows[0]});

    } catch (err) {
        return next(err);
    }
})

// delete specified invoice in database.
router.delete("/:id", async function(req, res, next){
    try {
        let id = req.params.id;

        let response = await db.query(`
            DELETE FROM invoices 
            WHERE id=$1
            RETURNING id`,
            [id]
        );

        if (response.rows.length === 0){
            throw new ExpressError("Invoice does not exist!", 404);
        }

        return res.json({status: "deleted"});
    
    } catch(err){

        return next(err);
    }
})

module.exports = router;