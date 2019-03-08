process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");

let db = require("../db")

// let company = {"code": "TEST", "name": "TESTING", "description": "SUPERTEST"}

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
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ companies: [{ code: "TEST", name: "TESTING" }] })
    })
})

describe("GET /companies/:code", function(){
    test("Gets one company", async function(){
        const response = await request(app)
            .get("/companies/TEST");
        expect(response.statusCode).toBe(200);
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
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ company: { code: "TEST2", name: "TESTING2", description: "SUPERTEST2"} });

        let companies = await request(app)
            .get("/companies");

        expect(companies.rows.length).toEqual(2);
    })
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async function() {
    // close db connection
    await db.end();
});