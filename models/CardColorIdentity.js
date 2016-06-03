"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var CardColorIdentity = sequelize.define("CardColorIdentity",
        {
            cardcoloridentityid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            }
        },
        {
            tableName: 'cardcoloridentities',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardColorIdentity.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                    CardColorIdentity.belongsTo(models.ColorIdentity, {
                        foreignKey: {
                            name: 'coloridentityid',
                            allowNull: false
                        }
                    });
                }
            }
        }
    );

    return CardColorIdentity;
};
