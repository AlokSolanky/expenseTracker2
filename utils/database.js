const Sequelize = require(`sequelize`);
const sequelize = new Sequelize(`expense`, `root`, `alok`, {
  dialect: `mysql`,
  host: `localhost`,
});
module.exports = sequelize;
