/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Add chat_id column to users table
  if (await knex.schema.hasTable('users')) {
    await knex.schema.alterTable('users', (table) => {
      table.integer('chat_id').defaultTo(null);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Remove chat_id column from users table
  if (await knex.schema.hasTable('users')) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('chat_id');
    });
  }
};
