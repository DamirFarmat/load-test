const { Users } = require('../models/models.js');
const bcrypt = require('bcrypt');
const sequelize = require('../db');

async function createAdmin() {
    try {
        // Ждем 5 секунд, чтобы убедиться, что таблицы созданы
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await sequelize.authenticate();
        console.log('Connection to database has been established successfully.');

        // Проверяем существование таблицы
        await sequelize.query('SELECT 1 FROM users LIMIT 1').catch(async (err) => {
            console.log('Table does not exist yet, waiting...');
            // Ждем еще 5 секунд
            await new Promise(resolve => setTimeout(resolve, 5000));
        });

        const adminExists = await Users.findOne({
            where: { email: 'admin@admin.com' }
        });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('P@ssw0rd', 10);
            await Users.create({
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 'ADMIN'
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error:', error);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

createAdmin();