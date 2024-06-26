const {DataTypes} = require('sequelize');
const sequelize = require('../util/database');
const Tag = require('./tag');

const Task = sequelize.define('task', {
    title: {
        type: DataTypes.TEXT,
        allowNull:false
    }, 
    content: {
        type: DataTypes.TEXT,
        allowNull:false
    },
    labels: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull:true
    },  
    assignees: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull:true
    },   
});

Task.belongsToMany(Tag, {through:"Card_Tag"});
Tag.belongsToMany(Task, {through:"Card_Tag"});

module.exports = Task;
// models/task.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../util/database');

// const Task = sequelize.define('task', {
//   title: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   }, 
//   content: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
//   // ... 其他字段
//   columnId: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   }
// });

// module.exports = Task;