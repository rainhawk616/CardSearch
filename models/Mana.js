"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var Mana = sequelize.define("Mana",
        {
            manaid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            }
        },
        {
            tableName: 'mana',
            timestamps: false,
            paranoid: false,
            indexes: [
                {
                    fields: ['description']
                }
            ]
        }
    );

    return Mana;
};
