/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    if (!(await knex.schema.hasTable('customers'))) {
      await knex.schema.createTable('customers', (table) => {
        table.increments('id').primary();
        table.string("name").defaultTo(null);
        table.integer("telegram_id").defaultTo(null);
        table.string("telegram_link").defaultTo(null);
        table.timestamp('created_at').notNull().defaultTo(knex.raw('NOW()'));
        table.timestamp('updated_at').notNull().defaultTo(knex.raw('NOW()'));
      });
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('customers');
  };
  
