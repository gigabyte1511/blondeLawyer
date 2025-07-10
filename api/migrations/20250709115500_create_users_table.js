/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    if (!(await knex.schema.hasTable('users'))) {
      await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string("name").defaultTo(null);
        table.integer("telegram_id").unique().defaultTo(null);
        table.string("telegram_link").defaultTo(null);
        table.string("role").defaultTo(null);
        table.timestamp('created_at').notNull().defaultTo(knex.raw('NOW()'));
        table.timestamp('updated_at').notNull().defaultTo(knex.raw('NOW()'));
      });
    }
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
