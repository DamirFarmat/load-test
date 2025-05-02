const { Attack, Load, Label } = require('../models/models');
const ApiError = require('../error/ApiError');

class AttackController {
    async create(req, res, next) {
        try {
            const { name, target, port, id_load, time, labels } = req.body;

            if (!name || !target || !id_load || !time) {
                return next(ApiError.badRequest('Не все обязательные поля заполнены'));
            }

            const load = await Load.findOne({ where: { id: id_load } });
            if (!load) {
                return next(ApiError.badRequest('Шаблон не найден'));
            }

            const attack = await Attack.create({
                name,
                target,
                port: port || null,
                id_load,
                time
            });

            if (labels && labels.length > 0) {
                for (const label of labels) {
                    let labelInstance = await Label.findOne({
                        where: { name: label.name }
                    });

                    if (!labelInstance) {
                        labelInstance = await Label.create({
                            name: label.name,
                            color: label.color
                        });
                    }

                    await attack.addLabel(labelInstance);
                }
            }

            const createdAttack = await Attack.findOne({
                where: { id: attack.id },
                include: [
                    { model: Load },
                    { model: Label }
                ]
            });

            return res.json(createdAttack);
        } catch (e) {
            console.error('Error creating attack:', e);
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        try {
            const attacks = await Attack.findAll({
                include: [
                    { model: Load },
                    { model: Label }
                ]
            });
            return res.json(attacks);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const attack = await Attack.findOne({
                where: { id },
                include: [
                    { model: Load },
                    { model: Label }
                ]
            });
            return res.json(attack);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async update(req, res, next) {
        try {
            const { id, name, target, port, id_load, time, labels } = req.body;

            if (!id) {
                return next(ApiError.badRequest('Не указан ID атаки'));
            }

            const attack = await Attack.findOne({ where: { id } });
            if (!attack) {
                return next(ApiError.badRequest('Атака не найдена'));
            }

            if (id_load) {
                const load = await Load.findOne({ where: { id: id_load } });
                if (!load) {
                    return next(ApiError.badRequest('Шаблон не найден'));
                }
            }

            await attack.update({
                name: name || attack.name,
                target: target || attack.target,
                port: port || attack.port,
                id_load: id_load || attack.id_load,
                time: time || attack.time
            });

            if (labels) {
                const labelInstances = await Promise.all(
                    labels.map(label => Label.findOrCreate({
                        where: { name: label.name },
                        defaults: { color: label.color }
                    }))
                );
                await attack.setLabels(labelInstances.map(([label]) => label));
            }

            const updatedAttack = await Attack.findOne({
                where: { id },
                include: [
                    { model: Load },
                    { model: Label }
                ]
            });

            return res.json(updatedAttack);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {
        try {
            const { name } = req.body;
            if (!name) {
                return next(ApiError.badRequest('Не указано имя атаки'));
            }

            const attack = await Attack.findOne({ where: { name } });
            if (!attack) {
                return next(ApiError.badRequest('Атака не найдена'));
            }

            await attack.destroy();
            return res.json({ message: 'Атака успешно удалена' });
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async updateStatus(req, res, next) {
        const { id, status } = req.body;
        if (!id || !status) {
            return next(ApiError.badRequest("Не указан ID или статус атаки"));
        }

        try {
            const attack = await Attack.findOne({ where: { id } });
            if (!attack) {
                return next(ApiError.badRequest("Атака не найдена"));
            }

            attack.status = status;
            await attack.save();

            if (res) {
                return res.json({ message: `Статус атаки ${id} изменён на "${status}"` });
            }
        } catch (error) {
            return next(ApiError.internal("Ошибка при обновлении статуса атаки"));
        }
    }

    async saveChart(req, res, next) {
        const { id, chartData } = req.body;
        
        if (!id || !chartData) {
            return next(ApiError.badRequest('Не указаны ID атаки или данные графика'));
        }

        try {
            const attack = await Attack.findOne({ where: { id } });
            if (!attack) {
                return next(ApiError.badRequest('Атака не найдена'));
            }

            await attack.update({ graph: chartData });
            return res.json({ message: 'Данные графика успешно сохранены' });
        } catch (error) {
            return next(ApiError.internal('Ошибка при сохранении данных графика'));
        }
    }

    async duplicate(req, res, next) {
        try {
            const { id } = req.body;
            if (!id) {
                return next(ApiError.badRequest('Не указан ID атаки'));
            }

            const originalAttack = await Attack.findOne({
                where: { id },
                include: [
                    { model: Load },
                    { model: Label }
                ]
            });

            if (!originalAttack) {
                return next(ApiError.badRequest('Атака не найдена'));
            }

            let baseName = `${originalAttack.name} - копия`;
            let newName = baseName;
            let counter = 2;
            while (await Attack.findOne({ where: { name: newName } })) {
                newName = `${baseName} ${counter}`;
                counter++;
                // Ограничим до 100 попыток, чтобы не зациклиться
                if (counter > 100) {
                    return next(ApiError.badRequest('Дубликат с таким именем уже существует'));
                }
            }

            const newAttack = await Attack.create({
                name: newName,
                target: originalAttack.target,
                port: originalAttack.port,
                id_load: originalAttack.id_load,
                time: originalAttack.time
            });

            if (originalAttack.Labels && originalAttack.Labels.length > 0) {
                await newAttack.setLabels(originalAttack.Labels);
            }

            const createdAttack = await Attack.findOne({
                where: { id: newAttack.id },
                include: [
                    { model: Load },
                    { model: Label }
                ]
            });

            return res.json(createdAttack);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new AttackController();