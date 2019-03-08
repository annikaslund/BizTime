process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");

let db = require("../db")

beforeEach(async () => {
    await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('TEST', 'TESTING', 'SUPERTEST')
    `);
});

describe("GET /companies", function(){
    test("Gets all companies", async function(){
        const response = await request(app)
            .get("/companies");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ companies: [{ code: "TEST", name: "TESTING" }] })
    })
})

describe("GET /companies/:code", function(){
    test("Gets one company", async function(){
        const response = await request(app)
            .get("/companies/TEST");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ company: { code: "TEST", name: "TESTING", description: "SUPERTEST"} });
    })
})

describe("POST /companies", function(){
    test("Adds one company", async function(){
        const response = await request(app)
            .post("/companies")
            .send({
                code: "TEST2",
                name: "TESTING2",
                description: "SUPERTEST2"
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ company: { code: "TEST2", name: "TESTING2", description: "SUPERTEST2"} });

        const response1 = await request(app).get("/companies");

        expect(response1.body.companies.length).toEqual(2);
    })
})

describe("PUT /companies/:code", function(){
    test("Updates one company", async function(){
        const response = await request(app)
            .put("/companies/TEST")
            .send({
                code: "TEST2",
                name: "TESTING2",
                description: "SUPERTEST2"
            });
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ company: { code: "TEST2", name: "TESTING2", description: "SUPERTEST2"} });

        const response1 = await request(app).get("/companies");

        expect(response1.body.companies.length).toEqual(1);
    })
})

describe("DELETE /companies/:code", function(){
    test("Deletes one company", async function(){
        const response = await request(app)
            .delete("/companies/TEST");
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "status": "deleted"
          });

        const response1 = await request(app).get("/companies");

        expect(response1.body.companies.length).toEqual(0);
    })
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async function() {
    // close db connection
    await db.end();
});