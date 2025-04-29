const {Servers, Attack} = require('../models/models')
const ApiError = require('../error/ApiError');

class ServersController {
    async create(req,res,next){
        const {ip, login, password} = req.body;

        //Проверка параметров
        const missingParams = [];
        if (!ip) missingParams.push('ip');
        if (!login) missingParams.push('login');
        if (!password) missingParams.push('password');

        if (missingParams.length > 0) {
            return next(ApiError.badRequest(`Не заданы параметры: ${missingParams.join(', ')}`));
        }

        const candidate = await Servers.findOne({where: {ip}})
        if (candidate) {
            return next(ApiError.badRequest('Сервер с таким ip уже существует'))
        }

        //Запись в таблицу
        const server = await Servers.create({ip, login, password});
        return res.json(server)
    }

    async delete(req,res,next){
        const {ip} = req.body;
        if (!ip) {
            return next(ApiError.badRequest(`Не задан параметр IP`));
        }
        try {
            const deletedCount = await Servers.destroy({where: {ip}});
            if (deletedCount === 0) {
                return next(ApiError.badRequest(`Сервер с указанным IP не найден`));
            }
            return res.json({ message: 'Сервер успешно удален' });
        } catch (error) {
            return next(ApiError.internal('Ошибка при удалении сервера'));
        }
    }

    async getAll(req,res){
        const servers = await Servers.findAll()
        return res.json(servers)
    }

    async getOne(req,res,next){
        const {id} = req.params;

        if (!id) {
            return next(ApiError.badRequest('Не задан ID сервера'));
        }
        try {
            const server = await Servers.findOne({where: {id}});
            if (!server) {
                return next(ApiError.badRequest('Сервер не найден'));
            }
            return res.json(server);
        } catch (error) {
            return next(ApiError.internal('Ошибка при получении данных сервера'));
        }
    }
    async getAllmass() {
        return await Servers.findAll();
    }
}
module.exports = new ServersController()