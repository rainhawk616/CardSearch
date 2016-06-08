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
            },
            hand: {
                type: Sequelize.INTEGER
            },
            life: {
                type: Sequelize.INTEGER
            }
            //TODO test these jsonb fields in 9.4
            ,
            colorIdentity: {
                field: "coloridentity",
                type: Sequelize.JSON
            },
            legalities: {
                type: Sequelize.JSON
            },
            printings: {
                type: Sequelize.JSON
            },
            supertypes: {
                type: Sequelize.JSON
            },
            types: {
                type: Sequelize.JSON
            },
            subtypes: {
                type: Sequelize.JSON
            },
            names: {
                type: Sequelize.JSON
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
                    Card.hasMany(models.CardType, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                    Card.hasMany(models.CardSubtype, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                    Card.hasMany(models.CardName, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                    Card.hasMany(models.CardColorIdentity, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                    Card.hasMany(models.CardLegality, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                    Card.hasMany(models.CardRuling, {
                        foreignKey: 'cardid',
                        constraints: true
                    });
                }
            },
            indexes: [
                {
                    fields: ['name']
                },
                {
                    fields: ['text']
                },
                //TODO test these jsonb fields in 9.4
                // {
                //     fields: ['coloridentity'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['foreignnames'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['legalities'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['printings'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['types'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['supertypes'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['subtypes'],
                //     using: 'gin'
                // },
                // {
                //     fields: ['names'],
                //     using: 'gin'
                // }
            ]
        }
    );

    return Card;
};
