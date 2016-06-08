"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var CardName = sequelize.define("CardName",
        {
            cardnameid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            }
        },
        {
            tableName: 'cardnames',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardName.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                }
            },
            indexes: [
                {
                    fields: ['cardid']
                }
            ]
        }
    );

    return CardName;
};
