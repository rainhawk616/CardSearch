"use strict";

var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var utils = require('../utils/utils');

module.exports = function (sequelize, DataTypes) {
    var Printing = sequelize.define("Printing",
        {
            printingid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            artist: {
                type: Sequelize.STRING,
                allowNull: false
            },
            flavor: {
                type: Sequelize.TEXT
            },
            id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            imageName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            mciNumber: {
                type: Sequelize.STRING
            },
            multiverseid: {
                type: Sequelize.INTEGER
            },
            originalText: {
                field: "originaltext",
                type: Sequelize.TEXT
            },
            originalType: {
                field: "originaltype",
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.STRING
            },
            number: {
                type: Sequelize.STRING
            },
            releaseDate: {
                field: "releasedate",
                type: Sequelize.DATE,
                get: function () {
                    return utils.formatDate(this.getDataValue('releaseDate'));
                }
            },
            border: {
                type: Sequelize.STRING
            },
            source: {
                type: Sequelize.STRING
            },
            starter: {
                type: Sequelize.BOOLEAN
            },
            timeshifted: {
                type: Sequelize.BOOLEAN
            },
            foreignNames: {
                field: "foreignnames",
                type: Sequelize.JSONB
            }
        },
        {
            tableName: 'printings',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    Printing.belongsTo(models.Card, {
                        foreignKey: {
                            name: 'cardid',
                            allowNull: false
                        }
                    });
                    Printing.belongsTo(models.Rarity, {
                        foreignKey: {
                            name: 'rarityid',
                            allowNull: false
                        }
                    });
                    Printing.belongsTo(models.Watermark, {
                        foreignKey: {
                            name: 'watermarkid'
                        }
                    });
                    Printing.belongsTo(models.Set, {
                        foreignKey: {
                            name: 'setid',
                            allowNull: false
                        }
                    })
                }
            },
            indexes: [
                {
                    fields: ['cardid', 'rarityid', 'setid']
                },
                {
                    fields: ['foreignnames'],
                    using: 'gin'
                }
            ]
        }
    );

    return Printing;
};
