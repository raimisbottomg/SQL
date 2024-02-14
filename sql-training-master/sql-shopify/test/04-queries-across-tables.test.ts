import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("03", "04");
    }, minutes(1));

    it("should select count of apps which have free pricing plan", async done => {
        const query = `SELECT COUNT(pricing_plan_id) AS count
        FROM apps_pricing_plans
        WHERE pricing_plan_id IN (1,13)`;
        const result = await db.selectSingleRow(query);
        expect(result).toEqual({
            count: 1112
        });
        done();
    }, minutes(1));

    it("should select top 3 most common categories", async done => {
        const query = `
        SELECT COUNT(ac.category_id) AS count, c.title AS category
        FROM apps_categories ac
        JOIN categories c ON ac.category_id = c.id
        GROUP BY ac.category_id, c.title
        ORDER BY count DESC
        LIMIT 3;`;
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 1193, category: "Store design" },
            { count: 723, category: "Sales and conversion optimization" },
            { count: 629, category: "Marketing" }
        ]);
        done();
    }, minutes(1));

    it("should select top 3 prices by appearance in apps and in price range from $5 to $10 inclusive (not matters monthly or one time payment)", async done => {
        const query = `
        SELECT COUNT(*) AS count,pricing.price,CAST(SUBSTR(pricing.price, 2) AS DECIMAL(10, 2)) AS casted_price
    FROM apps_pricing_plans app_pricing
    JOIN pricing_plans pricing ON app_pricing.pricing_plan_id = pricing.id
    WHERE CAST(SUBSTR(pricing.price, 2) AS DECIMAL(10, 2)) BETWEEN 5 AND 10
    GROUP BY CAST(SUBSTR(pricing.price, 2) AS DECIMAL(10, 2))
    ORDER BY count DESC
    LIMIT 3;`;
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 225, price: "$9.99/month", casted_price: 9.99 },
            { count: 135, price: "$5/month", casted_price: 5 },
            { count: 114, price: "$10/month", casted_price: 10 }
        ]);
        done();
    }, minutes(1));
});