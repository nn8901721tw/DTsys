const {DataTypes} = require('sequelize');
const sequelize = require('../util/database');
const Task = require('./task');

const Column = sequelize.define('column', {
    name: {
        type: DataTypes.TEXT,
        allowNull:false
    }, 
    task: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull:true
    },  
});
                                                                   
Column.hasMany(Task);
module.exports = Column;

// models/column.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../util/database');

// const Column = sequelize.define('column', {
//   name: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   }
//   // 移除 task 字段，因为这将通过关联自动处理
// });

// module.exports = Column;