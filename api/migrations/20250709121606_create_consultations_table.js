/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("consultations", (table) => {
        table.increments('id').primary();
        table
            .bigInteger("expert_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE")
        table
            .bigInteger("customer_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE")
        table.text("type").notNullable();
        table.text("status").notNullable();
        table.text("message").nullable();
        table.timestamp("scheduled_for").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("consultations");
};
