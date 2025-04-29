const { Servers } = require('../models/models');
const { Client } = require('ssh2');
const ApiError = require('../error/ApiError');

class SSHController {

    async executeCommandForOne(req, res, next) {
        const { command } = req.body;
        const { id } = req.params;

        if (!command) {
            return next(ApiError.badRequest("Не задана команда"));
        }

        try {
            const server = await Servers.findByPk(id);
            if (!server) {
                return next(ApiError.notFound("Сервер не найден"));
            }

            const conn = new Client();
            conn.on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err) {
                        conn.end();
                        return next(ApiError.internal("Ошибка выполнения команды"));
                    }

                    let output = '';
                    stream.on('data', (data) => {
                        output += data.toString();
                    }).on('close', () => {
                        conn.end();
                        return res.json({ ip: server.ip, output });
                    });
                });
            }).on('error', (err) => {
                return next(ApiError.internal("Ошибка подключения к серверу: " + err.message));
            }).connect({
                host: server.ip,
                port: 22,
                username: server.login,
                password: server.password,
            });

        } catch (error) {
            return next(ApiError.internal("Ошибка при выполнении команды"));
        }
    }


    async executeCommand(req, res, next) {
        const { command } = req.body;
        if (!command) {
            return next(ApiError.badRequest("Не задана команда для выполнения"));
        }

        try {
            const servers = await Servers.findAll();

            // Функция для подключения и выполнения команды на одном сервере
            const executeOnServer = (server) => {
                return new Promise((resolve, reject) => {
                    const conn = new Client();
                    conn.on('ready', () => {
                        conn.exec(command, (err, stream) => {
                            if (err) {
                                reject(`Ошибка выполнения на сервере ${server.ip}: ${err.message}`);
                                return conn.end();
                            }

                            let output = '';
                            stream.on('data', (data) => {
                                output += data.toString();
                            }).on('close', () => {
                                resolve({ ip: server.ip, output });
                                conn.end();
                            });
                        });
                    }).on('error', (err) => {
                        reject(`Ошибка подключения к серверу ${server.ip}: ${err.message}`);
                    }).connect({
                        host: server.ip,
                        port: 22,
                        username: server.login,
                        password: server.password,
                    });
                });
            };

            // Выполнение команды на всех серверах параллельно
            const results = await Promise.all(
                servers.map(server =>
                    executeOnServer(server)
                        .catch(error => ({ ip: server.ip, error })) // Добавляем обработку ошибок для каждого сервера
                )
            );

            return res.json(results);
        } catch (error) {
            return next(ApiError.internal('Ошибка при выполнении команды на серверах'));
        }
    }

    async payloadCommand(req, res, next) {
        // Возможно, здесь будет другая логика
    }
}

module.exports = new SSHController();
