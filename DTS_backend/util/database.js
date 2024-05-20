// connection postgres
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'postgres',
    'postgres',
    'postgres',
    {
        host: '140.115.126.47',
        dialect:'postgres',
        port:5432
    },
    
);

module.exports = sequelize;