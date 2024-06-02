// connection postgres

require('dotenv').config(); // 这行代码确保能从 .env 文件加载环境变量

const Sequelize = require('sequelize');

// 使用环境变量来创建 Sequelize 实例
const sequelize = new Sequelize(
    process.env.PG_DB,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        dialect: 'postgres',
        port: 5432
    }
);

module.exports = sequelize;




//遠端
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize(
//     'postgres',
//     'postgres',
//     'postgres',
//     {
//         host: 'localhost',
//         dialect:'postgres',
//         port:5432
//     },
    
// );

// module.exports = sequelize;


//localhost
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize(
//     'DTsys',
//     'postgres',
//     'yenn',
//     {
//         host: 'localhost',
//         dialect:'postgres',
//         port:5432
//     },
    
// );

// module.exports = sequelize;