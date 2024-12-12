const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE, 'root', process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});


const connectionDataBase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

connectionDataBase()