"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var Color = sequelize.define("Color",
        {
            colorid: {
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
            tableName: 'colors',
            timestamps: false,
            paranoid: false,
            indexes: [
                {
                    fields: ['description']
                }
            ]
        }
    );

    return Color;
};
