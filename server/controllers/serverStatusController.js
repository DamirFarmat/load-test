const ServersController = require('../controllers/serversController');
const sshController = require('./sshController');

const checkServerStatus = async (req, res, next) => {
    try {
        const servers = await ServersController.getAllmass();

        if (!servers || servers.length === 0) {
            return res.status(404).json({ error: "Серверы не найдены" });
        }

        // Указываем команду, которую нужно выполнить
        req.body = { command: "top -bn2 | grep 'Cpu' | tail -1 && free -h" };

        // Разбираем строку с загрузкой CPU
        const parseCpuUsage = (cpuLine) => {
            // Заменяем запятые на точки для унификации
            const normalizedLine = cpuLine.replace(/,/g, '.');

            // Ищем значения us, sy, ni (работает для обоих форматов)
            // Пример: "%Cpu(s):  0.2 us,  1.3 sy,  0.0 ni, ..."
            const us = normalizedLine.match(/([0-9.]+)\s*us/);
            const sy = normalizedLine.match(/([0-9.]+)\s*sy/);
            const ni = normalizedLine.match(/([0-9.]+)\s*ni/);

            if (us && sy && ni) {
                const cpuUsage = parseFloat(us[1]) + parseFloat(sy[1]) + parseFloat(ni[1]);
                return `${cpuUsage.toFixed(1)}%`;
            }

            return "N/A";
        };

// Разбираем строку с информацией о памяти
        const parseMemoryUsage = (memLines) => {
            const lines = memLines.split("\n").map(line => line.trim());
            const memMatch = lines.find(line => line.startsWith("Mem:"));

            if (memMatch) {
                // Ищем значения used и free
                const memValues = memMatch.match(/(\d+(?:\.\d+)?[MG]i)/g);
                return memValues ? `Used: ${memValues[1]}, Free: ${memValues[2]}` : "N/A";
            }

            return "N/A";
        };

        const statuses = await Promise.all(servers.map(async (server) => {
            try {
                // Создаем моковый `req` объект для передачи в executeCommand
                const reqMock = {
                    body: req.body, // Передаем команду
                };
                const resMock = {
                    json: (data) => data, // Просто возвращаем данные
                };

                const output = await sshController.executeCommand(reqMock, resMock, next);

                if (!output || !Array.isArray(output)) {
                    throw new Error("Нет данных от сервера");
                }

                // Ищем результат для конкретного сервера по IP
                const serverOutput = output.find(item => item.ip === server.ip);
                if (!serverOutput || serverOutput.error) {
                    throw new Error(serverOutput ? serverOutput.error : "Ошибка выполнения команды");
                }

                const [cpuLine, ...memLines] = serverOutput.output.split("\n");
                const cpuUsage = parseCpuUsage(cpuLine);
                const memUsage = parseMemoryUsage(memLines.join("\n"));

                return {
                    id: server.id,
                    ip: server.ip,
                    status: "online",
                    cpu_usage: cpuUsage,
                    memory_usage: memUsage
                };
            } catch (error) {
                return {
                    id: server.id,
                    ip: server.ip,
                    status: "offline",
                    error: error.message
                };
            }
        }));

        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при проверке серверов" });
    }
};

const checkServerStatusOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Не задан ID сервера" });
        }
        const server = await ServersController.getOne({ params: { id } }, { json: s => s }, next);
        if (!server || !server.ip) {
            return res.status(404).json({ error: "Сервер не найден" });
        }
        req.body = { command: "top -bn2 | grep 'Cpu' | tail -1 && free -h" };
        const parseCpuUsage = (cpuLine) => {
            // Заменяем запятые на точки для унификации
            const normalizedLine = cpuLine.replace(/,/g, '.');

            // Ищем значения us, sy, ni (работает для обоих форматов)
            // Пример: "%Cpu(s):  0.2 us,  1.3 sy,  0.0 ni, ..."
            const us = normalizedLine.match(/([0-9.]+)\s*us/);
            const sy = normalizedLine.match(/([0-9.]+)\s*sy/);
            const ni = normalizedLine.match(/([0-9.]+)\s*ni/);

            if (us && sy && ni) {
                const cpuUsage = parseFloat(us[1]) + parseFloat(sy[1]) + parseFloat(ni[1]);
                return `${cpuUsage.toFixed(1)}%`;
            }

            return "N/A";
        };
        const parseMemoryUsage = (memLines) => {
            const lines = memLines.split("\n").map(line => line.trim());
            const memMatch = lines.find(line => line.startsWith("Mem:"));
            if (memMatch) {
                // Ищем значения used и free
                const memValues = memMatch.match(/(\d+(?:\.\d+)?[MG]i)/g);
                return memValues ? `Used: ${memValues[1]}, Free: ${memValues[2]}` : "N/A";
            }
            return "N/A";
        };
        // Моковый req/res для executeCommand
        const reqMock = { body: req.body };
        const resMock = { json: (data) => data };
        const outputArr = await sshController.executeCommand(reqMock, resMock, next);
        if (!outputArr || !Array.isArray(outputArr)) {
            return res.status(500).json({ error: "Нет данных от сервера" });
        }
        const serverOutput = outputArr.find(item => item.ip === server.ip);
        if (!serverOutput || serverOutput.error) {
            return res.status(500).json({ error: serverOutput ? serverOutput.error : "Ошибка выполнения команды" });
        }
        const [cpuLine, ...memLines] = serverOutput.output.split("\n");
        const cpuUsage = parseCpuUsage(cpuLine);
        const memUsage = parseMemoryUsage(memLines.join("\n"));
        return res.json({
            id: server.id,
            ip: server.ip,
            status: "online",
            cpu_usage: cpuUsage,
            memory_usage: memUsage
        });
    } catch (error) {
        return res.status(500).json({ error: "Ошибка при проверке статуса сервера" });
    }
};

module.exports = { checkServerStatus, checkServerStatusOne };
