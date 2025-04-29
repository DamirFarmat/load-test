const { Label } = require('../models/models');
const ApiError = require('../error/ApiError');

class LabelController {
    async getAll(req, res, next) {
        try {
            const labels = await Label.findAll();
            return res.json(labels);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return next(ApiError.badRequest('Не указан id ярлыка'));
            }
            const label = await Label.findByPk(id);
            if (!label) {
                return next(ApiError.badRequest('Ярлык не найден'));
            }
            await label.destroy();
            return res.json({ message: 'Ярлык успешно удалён' });
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new LabelController(); 