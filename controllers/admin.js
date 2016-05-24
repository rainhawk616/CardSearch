var models = require("../models/");
var sequelize = require('../models/index').sequelize;
var Sequelize = require('../models/index').Sequelize;
var Promise = require("bluebird");

module.exports = {
    registerRoutes: function (app, passportConfig) {
        app.get('/admin/dashboard', passportConfig.isAdminAuthorized, this.dashboard);
        //TODO check admin
        app.get('/admin/sets', this.sets);
        //TODO check admin
        app.get('/admin/setimport', this.setimport);

    },
    dashboard: function (req, res, next) {
        res.render('admin/dashboard', {
            title: 'Dashboard'
        });
    },
    sets: function (req, res, next) {
        models.Set.findAll({

        }).then(function (sets) {
            res.render('admin/sets', {
                title: 'Sets',
                sets: sets
            });
        });
    },
    setimport: function (req, res, next) {
        models.Set.findAll({

        }).then(function (sets) {
            res.render('admin/sets', {
                title: 'Sets',
                sets: sets
            });
        });
    }
};
