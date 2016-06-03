"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var CardType = sequelize.define("CardType",
        {
            cardtypeid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            }
        },
        {
            tableName: 'cardtypes',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardType.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                    CardType.belongsTo(models.Type, {
                        foreignKey: {
                            name: 'typeid',
                            allowNull: false
                        }
                    });
                }
            }
        }
    );

    return CardType;
};
