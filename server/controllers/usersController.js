const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users} = require('../models/models.js');

const generateJwt = (id, email, role) => {
    return jwt.sign({id, email, role}, process.env.SECRET_KEY, {expiresIn: '12h'})
}

class UsersController {
    async registration(req,res, next){
        const {email, password, role } = req.body;
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        const candidate = await Users.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await Users.create({email, password: hashPassword, role});
        const token = generateJwt(user.id, user.email, user.role);
        return res.json({token})
    }

    async login(req,res, next){
        const {email, password} = req.body;
        const user = await Users.findOne({where: {email}})
        if (!user) {
            return next(ApiError.badRequest('Пользователь с таким email не найден'))
        }
        let comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return next(ApiError.badRequest('Указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role);
        return res.json({token})
    }

    async check(req,res,next){
        const token = generateJwt(req.user.id, req.user.email, req.user.role);
        return res.json({token})
    }

    async changePassword(req, res, next) {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(ApiError.badRequest('Все поля обязательны для заполнения'));
        }
        const user = await Users.findOne({ where: { id: req.user.id } });
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return next(ApiError.badRequest('Старый пароль неверный'));

        if (oldPassword === newPassword) return next(ApiError.badRequest('Новый пароль не должен совпадать со старым'));

        const hashPassword = await bcrypt.hash(newPassword, 5);
        user.password = hashPassword;
        await user.save();

        return res.json({ message: 'Пароль успешно изменён' });
    }

    async getAllUsers(req, res, next) {
        const users = await Users.findAll({ attributes: ['id', 'email', 'role'] });
        return res.json(users);
    }

    async changeRole(req, res, next) {
        const { id, role } = req.body;
        if (!id || !role) {
            return next(ApiError.badRequest('id и role обязательны'));
        }
        if (req.user.id === id) {
            return next(ApiError.badRequest('Нельзя менять свою собственную роль'));
        }
        const user = await Users.findOne({ where: { id } });
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));
        user.role = role;
        await user.save();
        return res.json({ message: 'Роль успешно изменена', user: { id: user.id, email: user.email, role: user.role } });
    }

    async deleteUser(req, res, next) {
        const { id } = req.body;
        if (!id) {
            return next(ApiError.badRequest('id обязателен'));
        }
        if (req.user.id === id) {
            return next(ApiError.badRequest('Нельзя удалить самого себя'));
        }
        const user = await Users.findOne({ where: { id } });
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));
        await user.destroy();
        return res.json({ message: 'Пользователь удалён', id });
    }

    async createUser(req, res, next) {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return next(ApiError.badRequest('Все поля обязательны для заполнения'));
        }
        if (!['USER', 'ADMIN'].includes(role)) {
            return next(ApiError.badRequest('Некорректная роль пользователя'));
        }
        const candidate = await Users.findOne({ where: { email } });
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await Users.create({ email, password: hashPassword, role });
        return res.json({ 
            message: 'Пользователь успешно создан',
            user: { id: user.id, email: user.email, role: user.role }
        });
    }

    async changeUserEmail(req, res, next) {
        const { userId, newEmail, adminPassword } = req.body;
        if (!userId || !newEmail || !adminPassword) {
            return next(ApiError.badRequest('Все поля обязательны для заполнения'));
        }

        // Проверяем пароль администратора
        const admin = await Users.findOne({ where: { id: req.user.id } });
        if (!admin) return next(ApiError.badRequest('Администратор не найден'));

        const isMatch = await bcrypt.compare(adminPassword, admin.password);
        if (!isMatch) return next(ApiError.badRequest('Неверный пароль администратора'));

        // Проверяем существование пользователя
        const user = await Users.findOne({ where: { id: userId } });
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        // Проверяем, не занят ли email
        const candidate = await Users.findOne({ where: { email: newEmail } });
        if (candidate && candidate.id !== userId) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        }

        user.email = newEmail;
        await user.save();

        return res.json({ message: 'Email успешно изменен' });
    }

    async changeUserPassword(req, res, next) {
        const { userId, newPassword, adminPassword } = req.body;
        if (!userId || !newPassword || !adminPassword) {
            return next(ApiError.badRequest('Все поля обязательны для заполнения'));
        }

        // Проверяем пароль администратора
        const admin = await Users.findOne({ where: { id: req.user.id } });
        if (!admin) return next(ApiError.badRequest('Администратор не найден'));

        const isMatch = await bcrypt.compare(adminPassword, admin.password);
        if (!isMatch) return next(ApiError.badRequest('Неверный пароль администратора'));

        // Проверяем существование пользователя
        const user = await Users.findOne({ where: { id: userId } });
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        const hashPassword = await bcrypt.hash(newPassword, 5);
        user.password = hashPassword;
        await user.save();

        return res.json({ message: 'Пароль успешно изменен' });
    }

    async adminEditUser(req, res, next) {
        const { userId, newEmail, newPassword, adminPassword } = req.body;
        if (!userId || !adminPassword) {
            return next(ApiError.badRequest('userId и adminPassword обязательны'));
        }

        // Проверяем пароль администратора
        const admin = await Users.findOne({ where: { id: req.user.id } });
        if (!admin) return next(ApiError.badRequest('Администратор не найден'));

        const isMatch = await bcrypt.compare(adminPassword, admin.password);
        if (!isMatch) return next(ApiError.badRequest('Неверный пароль администратора'));

        // Проверяем существование пользователя
        const user = await Users.findOne({ where: { id: userId } });
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        // Меняем email, если передан
        if (newEmail && newEmail !== user.email) {
            const candidate = await Users.findOne({ where: { email: newEmail } });
            if (candidate && candidate.id !== userId) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }
            user.email = newEmail;
        }

        // Меняем пароль, если передан
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 5);
        }

        await user.save();

        return res.json({ message: 'Пользователь успешно изменён' });
    }
}
module.exports = new UsersController()