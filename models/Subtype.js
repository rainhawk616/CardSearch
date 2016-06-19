"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var Subtype = sequelize.define("Subtype",
        {
            subtypeid: {
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
            tableName: 'subtypes',
            timestamps: false,
            paranoid: false,
            indexes: [
                {
                    fields: ['description']
                }
            ]
        }
    );

    return Subtype;
};
