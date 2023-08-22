const Sequelize = require(`sequelize`);
const sequelize = require(`../utils/database`);
const DownloadUrl = sequelize.define(`urls`, {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = DownloadUrl;
