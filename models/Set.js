"use strict";

var Sequelize = require('sequelize');
var utils = require('../utils');

module.exports = function (sequelize) {
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
            complete: {
                field: "complete",
                type: Sequelize.BOOLEAN,
                default: false
            },
            releaseDate: {
                field: "releasedate",
                type: Sequelize.DATE,
                allowNull: true,
                get: function()  {
                    return utils.formatDate(this.getDataValue('releaseDate'));
                }
            },
            gathererCode: {
                field: "gatherercode",
                type: Sequelize.STRING,
                allowNull: true,
                unique: true
            },
            onlineOnly: {
                field: "onlineonly",
                type: Sequelize.BOOLEAN,
                allowNull: true
            }
        },
        {
            tableName: 'set',
            timestamps: false,
            paranoid: false
        }
    );
};
