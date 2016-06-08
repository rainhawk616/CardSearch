"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var CardLegality = sequelize.define("CardLegality",
        {
            cardlegalityid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            }
        },
        {
            tableName: 'cardlegalities',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardLegality.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                    CardLegality.belongsTo(models.Format, {
                        foreignKey: {
                            name: 'formatid',
                            allowNull: false
                        }
                    });
                    CardLegality.belongsTo(models.Legality, {
                        foreignKey: {
                            name: 'legalityid',
                            allowNull: false
                        }
                    });
                }
            },
            indexes: [
                {
                    unique: true,
                    fields: ['formatid','legalityid','cardid']
                }
            ]
        }
    );

    return CardLegality;
};
