"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var PrintingForeignName = sequelize.define("PrintingForeignName",
        {
            printingforeignnameid: {
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
            tableName: 'printingforeignnames',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    PrintingForeignName.belongsTo(models.Printing, {
                        foreignKey: {
                            name: 'printingid',
                            allowNull: false
                        }
                    });
                    PrintingForeignName.belongsTo(models.Language, {
                        foreignKey: {
                            name: 'languageid',
                            allowNull: false
                        }
                    });
                }
            },
            indexes: [
                {
                    fields: ['printingid', 'languageid']
                }
            ]
        }
    );

    return PrintingForeignName;
};
