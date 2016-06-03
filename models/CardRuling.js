"use strict";

var Sequelize = require('sequelize');
var utils = require('../utils');

module.exports = function (sequelize, DataTypes) {
    var CardRuling = sequelize.define("CardRuling",
        {
            cardrulingid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            date: {
                field: "date",
                type: Sequelize.DATE,
                allowNull: false,
                get: function () {
                    return utils.formatDate(this.getDataValue('releaseDate'));
                }
            },
            text: {
                type: Sequelize.TEXT,
                allowNull: false
            }
        },
        {
            tableName: 'cardrulings',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardRuling.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                }
            }
        }
    );

    return CardRuling;
};
