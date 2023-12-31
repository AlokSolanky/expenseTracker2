const Sequelize = require(`sequelize`);
const sequelize = require(`../utils/database`);
const ForgotPassword = sequelize.define(`forgotpasswordrequests`, {
  id: {
    type: Sequelize.STRING,
    // autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
});

module.exports = ForgotPassword;
