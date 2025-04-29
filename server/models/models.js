const sequelize = require("../db");
const {DataTypes} = require("sequelize");

const Users = sequelize.define("users", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING, unique: false},
    role: {type: DataTypes.STRING, defaultValue: 'USER'},
})

const Servers = sequelize.define("servers", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    ip: {type: DataTypes.STRING, unique: true},
    login: {type: DataTypes.STRING, unique: false},
    password: {type: DataTypes.STRING, unique: false},
})

const Label = sequelize.define("label", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    color: {type: DataTypes.STRING, allowNull: false},
})

const Attack = sequelize.define("attack", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    target: {type: DataTypes.STRING, unique: false},
    port: {type: DataTypes.INTEGER, unique: false},
    id_load: {type: DataTypes.INTEGER, unique: false},
    time: {type: DataTypes.INTEGER, unique: false},
    status: {type: DataTypes.STRING, defaultValue: "no", unique: false},
    graph: {type: DataTypes.JSON, allowNull: true, unique: false},
})

const Load = sequelize.define("load", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    bash: {type: DataTypes.STRING, unique: false},
    type: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
            isIn: [["L4", "L7"]],
        },
    }
})

// Связи между таблицами
Load.hasMany(Attack, { foreignKey: 'id_load', sourceKey: 'id' });
Attack.belongsTo(Load, { foreignKey: 'id_load', targetKey: 'id' });

// Связь многие-ко-многим между Attack и Label
Attack.belongsToMany(Label, { through: 'AttackLabels' });
Label.belongsToMany(Attack, { through: 'AttackLabels' });

module.exports = {
    Users,
    Servers,
    Attack,
    Load,
    Label
};