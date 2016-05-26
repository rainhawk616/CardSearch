"use strict";

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    var SetType = sequelize.define("SetType",
        {
            settypeid: {
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
            tableName: 'settypes',
            timestamps: false,
            paranoid: false
        }
    );

    return SetType;
};
