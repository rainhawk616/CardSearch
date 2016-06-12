"use strict";

var Sequelize = require('sequelize');
var utils = require('../utils/utils');

module.exports = function (sequelize) {
    var Set = sequelize.define("Set",
        {
            setid: {
                field: "setid",
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                field: "name",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            code: {
                field: "code",
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            releaseDate: {
                field: "releasedate",
                type: Sequelize.DATE,
                allowNull: true,
                get: function () {
                    return utils.formatDate(this.getDataValue('releaseDate'));
                }
            },
            gathererCode: {
                field: "gatherercode",
                type: Sequelize.STRING,
                allowNull: true,
                unique: true
            },
            onlineOnly: {
                field: "onlineonly",
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            oldCode: {
                field: "oldcode",
                type: Sequelize.STRING,
                unique: true
            },
            magicRaritiesCodes: {
                field: "magicraritiescodes",
                type: Sequelize.JSONB
            },
            translations: {
                field: "translations",
                type: Sequelize.JSONB
            },
            numberOfCards: {
                field: "numberofcards",
                type: Sequelize.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'sets',
            timestamps: false,
            paranoid: false,
            classMethods: {
                associate: function (models) {
                    Set.belongsTo(models.Border, {
                        foreignKey: {
                            name: 'borderid',
                            allowNull: false
                        }
                    });
                    Set.belongsTo(models.SetType, {
                        foreignKey: {
                            name: 'settypeid',
                            allowNull: false
                        }
                    });
                    Set.belongsTo(models.Block, {
                        foreignKey: {
                            name: 'blockid'
                        }
                    });
                    Set.hasMany(models.Printing, {
                        foreignKey: 'setid',
                        constraints: true
                    });
                }
            },
            indexes: [
                {
                    fields: ['borderid', 'settypeid', 'blockid']
                },
                {
                    fields: ['magicraritiescodes'],
                    using: 'gin'
                },
                {
                    fields: ['translations'],
                    using: 'gin'
                }
            ]
        }
    );

    return Set;
};
