"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var PrintingName = sequelize.define("PrintingName",
        {
            printingnameid: {
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
            tableName: 'printingname',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    PrintingName.belongsTo(models.Printing, {
                        foreignKey: {
                            name: 'printingid',
                            allowNull: false
                        }
                    });
                }
            },
            indexes: [
                {
                    fields: ['printingid']
                }
            ]
        }
    );

    return PrintingName;
};
