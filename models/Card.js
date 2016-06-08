"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var Card = sequelize.define("Card",
        {
            cardid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            manaCost: {
                field: "manacost",
                type: Sequelize.STRING
            },
            cmc: {
                type: Sequelize.INTEGER
            },
            power: {
                type: Sequelize.STRING
            },
            toughness: {
                type: Sequelize.STRING
            },
            text: {
                type: Sequelize.TEXT
            },
            reserved: {
                type: Sequelize.BOOLEAN
            },
            loyalty: {
                type: Sequelize.INTEGER
            }
        },
        {
            tableName: 'cards',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    Card.belongsTo(models.Layout, {
                        foreignKey: {
                            name: 'layoutid'
                        }
                    });
                    Card.hasMany(models.CardSupertype, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                }
            },
            indexes: [
                {
                    fields: ['name']
                }
            ]
        }
    );

    return Card;
};
