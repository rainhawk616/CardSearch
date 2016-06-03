"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var CardSupertype = sequelize.define("CardSupertype",
        {
            cardsupertypeid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            }
        },
        {
            tableName: 'cardsupertypes',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardSupertype.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                    CardSupertype.belongsTo(models.Supertype, {
                        foreignKey: {
                            name: 'supertypeid',
                            allowNull: false
                        }
                    });
                }
            }
        }
    );

    return CardSupertype;
};
