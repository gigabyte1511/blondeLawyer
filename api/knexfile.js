const config = require("config");

module.exports = {
    development: {
        client: "postgresql",
        connection: {
            host: config.get("postgres.host"),
            port: config.get("postgres.port"),
            user: config.get("postgres.user"),
            password: config.get("postgres.pass"),
            database: config.get("postgres.database"),
        },
    },
};
