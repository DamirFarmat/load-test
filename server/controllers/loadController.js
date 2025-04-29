const { Load, Attack} = require('../models/models');
const ApiError = require('../error/ApiError');

class LoadController {
    async create(req,res,next){
        const {name, bash, type} = req.body;

        //Проверка параметров
        const missingParams = [];
        if (!name) missingParams.push('name');
        if (!bash) missingParams.push('bash');
        if (!type || !["L4", "L7"].includes(type)) missingParams.push('type');

        if (missingParams.length > 0) {
            return next(ApiError.badRequest(`Не заданы параметры: ${missingParams.join(', ')}`));
        }

        const candidate = await Load.findOne({where: {name}})
        if (candidate) {
            return next(ApiError.badRequest('Нагрузка с таким name уже существует'))
        }

        //Запись в таблицу
        const load = await Load.create({name, bash, type});
        return res.json(load)
    }

    async delete(req,res,next){
        const {name} = req.body;
        if (!name) {
            return next(ApiError.badRequest(`Не задан параметр name`));
        }
        try {
            const deletedCount = await Load.destroy({where: {name}});
            if (deletedCount === 0) {
                return next(ApiError.badRequest(`Нагрузка с указанным name не найдена`));
            }
            return res.json({ message: 'Нагрузка успешно удалена' });
        } catch (error) {
            return next(ApiError.internal('Ошибка при удалении Нагрузки'));
        }
    }

    async getAll(req,res){
        const loads = await Load.findAll()
        return res.json(loads)
    }

    async getOne(req,res,next){
        const {id} = req.params;

        if (!id) {
            return next(ApiError.badRequest('Не задан ID Нагрузки'));
        }
        try {
            const load = await Load.findOne({where: {id}});
            if (!load) {
                return next(ApiError.badRequest('Нагрузка не найдена'));
            }
            return res.json(load);
        } catch (error) {
            return next(ApiError.internal('Ошибка при получении данных Нагрузки'));
        }
    }
}

module.exports = new LoadController();