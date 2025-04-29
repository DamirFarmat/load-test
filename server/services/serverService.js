const { Server } = require('../models/models.js'); // Подключение модели сервера

const getServers = async () => {
    try {
        const servers = await Server.findAll(); // Получаем список серверов из базы данных
        return servers;
    } catch (error) {
        console.error('Ошибка при получении списка серверов:', error);
        return [];
    }
};

module.exports = { getServers };