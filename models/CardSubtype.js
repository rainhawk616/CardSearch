"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var CardSubtype = sequelize.define("CardSubtype",
        {
            cardsubtypeid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            }
        },
        {
            tableName: 'cardsubtypes',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    CardSubtype.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                    CardSubtype.belongsTo(models.Subtype, {
                        foreignKey: {
                            name: 'subtypeid',
                            allowNull: false
                        }
                    });
                }
            },
            indexes: [
                {
                    fields: ['subtypeid','cardid']
                }
            ]
        }
    );

    return CardSubtype;
};
