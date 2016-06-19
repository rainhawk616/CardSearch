"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var Legality = sequelize.define("Legality",
        {
            legalityid: {
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
            tableName: 'legalities',
            timestamps: false,
            paranoid: false,
            indexes: [
                {
                    fields: ['description']
                }
            ]
        }
    );

    return Legality;
};
