"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var ColorIdentity = sequelize.define("ColorIdentity",
        {
            coloridentityid: {
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
            tableName: 'coloridentities',
            timestamps: false,
            paranoid: false,
            indexes: [
                {
                    fields: ['description']
                }
            ]
        }
    );

    return ColorIdentity;
};
