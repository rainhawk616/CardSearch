"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var Supertype = sequelize.define("Supertype",
        {
            supertypeid: {
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
            tableName: 'supertypes',
            timestamps: false,
            paranoid: false,
            indexes: [
                {
                    fields: ['description']
                }
            ]
        }
    );

    return Supertype;
};
