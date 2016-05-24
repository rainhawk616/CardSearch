"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("Set",
        {
            setid: {
                field: "setid",
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                field: "name",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            code: {
                field: "code",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            gathererCode: {
                field: "gatherercode",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            magicCardsInfoCode: {
                field: "magiccardsinfocode",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            releaseDate: {
                field: "releasedate",
                type: Sequelize.DATE,
                allowNull: false
            },
            mkm_name: {
                field: "mkmname",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            mkm_id: {
                field: "mkmid",
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true
            },
            oldCode: {
                field: "oldcode",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            onlineOnly: {
                field: "onlineonly",
                type: Sequelize.BOOLEAN,
                allowNull: false
            }
        },
        {
            tableName: 'set',
            timestamps: false,
            paranoid: false
        }
    );
};
