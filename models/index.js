const dbConfig = require("../config/dbConfig.js");
const {Sequelize, Datatypes} = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

sequelize.authenticate()
.then(() => {
    console.log("Connection has been established successfully.");
}
)
.catch(err => {
    console.error("Unable to connect to the database: ", err);
}
);

const db = {};

db.Sequelize = Sequelize;//Sequelize is a constructor function
db.sequelize = sequelize;//sequelize is an instance of Sequelize

db.users = require("./userModel.js")(sequelize, Sequelize);//sequelize is an instance of Sequelize
db.products = require("./productModel.js")(sequelize, Sequelize);
db.images = require("./imageModel.js")(sequelize, Sequelize);

db.sequelize.sync({force: false })//{force: true} will drop the table if it already exists
//{force: false} will not drop the table if it already exists and will create the table if it does not exist

.then(() => {
    console.log("Drop and re-sync db.");
}
);

module.exports = db;

//{force: false} will not drop the table if it already exists
    