const { Attack, Load } = require('../models/models');
const SSHController = require('./sshController');
const ApiError = require('../error/ApiError');
const attackController = require('./attackController');

class StartAttackController {
    constructor() {
        this.attackTimers = {};
        this.startAttack = this.startAttack.bind(this);
        this.stopAttack = this.stopAttack.bind(this);
    }

    async startAttack(req, res, next) {
        const { id } = req.body;
        if (!id) {
            return next(ApiError.badRequest("Не указан ID атаки"));
        }

        try {
            const attack = await Attack.findOne({ where: { id } });
            if (!attack) {
                return next(ApiError.badRequest("Атака не найдена"));
            }

            const load = await Load.findOne({ where: { id: attack.id_load } });
            if (!load) {
                return next(ApiError.badRequest("Шаблон нагрузки не найден"));
            }

            let command = load.bash.replace("{{target}}", attack.target);
            if (command.includes("{{port}}") && attack.port) {
                command = command.replace("{{port}}", attack.port);
            }
            command = `${command} & echo $! > /tmp/last_pid`;

            await attackController.updateStatus({ body: { id: attack.id, status: "yes" } }, res, next);

            if (this.attackTimers[attack.id]) {
                clearTimeout(this.attackTimers[attack.id]);
            }

            this.attackTimers[attack.id] = setTimeout(() => {
                this.stopAttack({ body: { id: attack.id } }, res, next);
            }, attack.time * 60 * 1000);

            await SSHController.executeCommand({ body: { command } })
                .then((result) => console.log(`Команда запущена: ${command}`, result))
                .catch((error) => console.error("Ошибка при выполнении команды:", error));

            // Ответ отправляется только после всех асинхронных операций
            return res.json({ message: "Атака запущена" });

        } catch (error) {
            console.error("Ошибка при запуске атаки:", error);
            return next(ApiError.internal("Ошибка при запуске атаки"));
        }
    }

    async stopAttack(req, res, next) {
        const { id } = req.body;
        if (!id) {
            return next(ApiError.badRequest("Не указан ID атаки"));
        }

        try {
            const attack = await Attack.findOne({ where: { id } });
            if (!attack || attack.status === "no") {
                return res.json({ message: "Атака уже остановлена" });
            }

            await attackController.updateStatus({ body: { id: attack.id, status: "no" } }, res, next);
            console.log(`Статус атаки ${id} изменён на "no" в БД`);

            // Ожидаем завершение выполнения команды
            const result = await SSHController.executeCommand({ body: { command: "kill -9 $(cat /tmp/last_pid)" } });

            if (this.attackTimers[attack.id]) {
                clearTimeout(this.attackTimers[attack.id]);
                delete this.attackTimers[attack.id];
            }

            console.log(`Атака ${id} остановлена`);

            // Возвращаем ответ только после выполнения всех операций
            return res.json({ message: "Атака остановлена", result });

        } catch (error) {
            console.error("Ошибка при остановке атаки:", error);
            return next(ApiError.internal("Ошибка при остановке атаки"));
        }
    }
}

module.exports = new StartAttackController();
