process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");

let db = require("../db")


beforeEach(async () => {
    await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('TEST', 'TESTING', 'SUPERTEST')
    `);
    await db.query(`
        INSERT INTO invoices (id, comp_Code, amt, paid, paid_date)
        VALUES (25, 'TEST', 100, false, null)
    `);

});

describe("GET /invoices", function(){
    test("Gets all invoices", async function(){
        const response = await request(app)
            .get("/invoices");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ invoices: [{ id: 25, comp_code: "TEST" }] })
    })
})

describe("GET /invoices/:code", function(){
    test("Gets one invoice", async function(){
        const response = await request(app)
            .get("/invoices/25");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoice": {
              "id": 25,
              "amt": 100,
              "paid": false,
              "add_date": "2019-03-07T08:00:00.000Z",
              "paid_date": null,
              "company": {
                "code": "TEST",
                "name": "TESTING",
                "description": "SUPERTEST"
              }
            }
          });
    })
})

// describe("POST /invoices", function(){
//     test("Adds one invoice", async function(){
//         const response = await request(app)       .post("/invoices")
//             .send({
//                 id: 26,
//                 comp_Code: 'TEST',
//                 amt: 200
//             });
//         expect(response.statusCode).toEqual(200);
//         expect(response.body).toEqual({
//             "invoice": {
//               "id": 26,
//               "comp_code": 'TEST',
//               "amt": 200,
//               "paid": false,
//               "add_date": "2019-03-07T08:00:00.000Z",
//               "paid_date": null
//             }
//           });

//         const response1 = await request(app).get("/invoices");

//         expect(response1.body.invoices.length).toEqual(2);
//     })
// })

// describe("PUT /companies/:code", function(){
//     test("Updates one company", async function(){
//         const response = await request(app)
//             .put("/companies/TEST")
//             .send({
//                 code: "TEST2",
//                 name: "TESTING2",
//                 description: "SUPERTEST2"
//             });
        
//         expect(response.statusCode).toEqual(200);
//         expect(response.body).toEqual({ company: { code: "TEST2", name: "TESTING2", description: "SUPERTEST2"} });

//         const response1 = await request(app).get("/companies");

//         expect(response1.body.companies.length).toEqual(1);
//     })
// })

describe("DELETE /invoices/:id", function(){
    test("Deletes one company", async function(){
        const response = await request(app)
            .delete("/invoices/25");
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "status": "deleted"
          });

        const response1 = await request(app).get("/invoices");

        expect(response1.body.invoices.length).toEqual(0);
    })
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async function() {
    // close db connection
    await db.end();
});