const {DataTypes} = require('sequelize');
const sequelize = require('../util/database');


const Kanban_scaffolding = sequelize.define('kanban_scaffolding', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    sub_stage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scaffolding_template: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
  },
});


module.exports = Kanban_scaffolding;
