var models = require("../models/");
var sequelize = require('../models/index').sequelize;
var Sequelize = require('../models/index').Sequelize;
var Promise = require("bluebird");
var multer = require('multer');
var upload = multer({dest: '../uploads/'});
var fs = require('fs');

module.exports = {
    registerRoutes: function (app, passportConfig) {
        //TODO readd authorization check
        //app.get('/admin/*', this.authorize);
        app.get('/admin/', this.home);
        app.get('/admin/sets', this.sets);
        app.post('/admin/setsimport', upload.single("setsimport"), this.setsimport);
        app.get('/admin/set/:setid', this.set);
        app.post('/admin/set/:setid/import', upload.single("setimport"), this.setimport);

    },
    authorize: function (req, res, next) {
        if (req.isAuthenticated() && req.user.admin) {
            return next();
        }
        res.redirect('/login');
    },
    home: function (req, res, next) {
        res.render('admin/dashboard', {
            title: 'Dashboard'
        });
    },
    sets: function (req, res, next) {
        models.Set.findAll({
            order: [
                ['complete', 'ASC'],
                ['releasedate', 'ASC']
            ]
        }).then(function (sets) {
            res.render('admin/sets', {
                title: 'Sets',
                sets: sets
            });
        });
    },
    setsimport: function (req, res, next) {

        var content = fs.readFileSync(req.file.path);
        var setsFromFile = JSON.parse(content);

        if (setsFromFile.length === 0) {
            req.flash('errors', {msg: "Invalid set file"});
            req.session.save(function () {
                res.redirect('/admin/sets');
            });
        }
        else {
            var invalidFormat = false;
            for (var i = 0; i < setsFromFile.length; i++) {
                var set = setsFromFile[i];
                if (!set.hasOwnProperty('name') || !set.hasOwnProperty('code')) {
                    invalidFormat = true;
                    console.log("invalid set:", JSON.stringify(set));
                }
            }

            if (invalidFormat) {
                req.flash('errors', {msg: "Invalid set format"});
                req.session.save(function () {
                    res.redirect('/admin/sets');
                });
            }
            else {
                models.Set.findAll().then(function (sets) {
                    var existingSets = {};
                    var i = undefined;
                    for (i = 0; i < sets.length; i++) {
                        existingSets[sets[i].name] = true;
                    }

                    console.log("existing sets:", JSON.stringify(existingSets));

                    sequelize.transaction(function (transaction) {
                        var newSets = [];
                        for (i = 0; i < setsFromFile.length; i++) {
                            var set = setsFromFile[i];
                            if (!existingSets.hasOwnProperty(set.name)) {
                                existingSets[set.name] = set;

                                set.complete = false;
                                newSets.push(models.Set.create(set, {transaction: transaction}));
                            }
                        }
                        return Promise.all(newSets);
                    }).then(function (newSets) {
                        console.log("newSets:", JSON.stringify(newSets));

                        if (newSets.length === 0) {
                            req.flash('success', {msg: 'No new sets to import'});
                        }
                        else {
                            req.flash('success', {msg: newSets.length + ' sets imported'});
                        }

                        req.session.save(function () {
                            res.redirect('/admin/sets');
                        });
                    }).catch(function (err) {
                        console.log("err:", err);
                        req.flash('errors', {msg: "An error occured while adding new sets."});
                        req.session.save(function () {
                            res.redirect('/admin/sets');
                        });
                    });
                });
            }
        }
    },
    set: function (req, res, next) {
        models.Set.findById(req.params.setid).then(function (set) {
            if (set === null) {
                req.flash('errors', {msg: "No matching set could be found"});
                req.session.save(function () {
                    res.redirect('/admin/sets');
                });
            }
            else {
                res.render('admin/set', {
                    title: set.name,
                    set: set
                });
            }
        });
    },
    setimport: function (req, res, next) {
        var content = fs.readFileSync(req.file.path);
        var set = JSON.parse(content);

        models.Set.findById(req.params.setid).then(function (existingSet) {
            if (existingSet.name !== set.name) {
                req.flash('errors', {msg: "The imported set doesn't match the existing set."});
                req.session.save(function () {
                    res.redirect('/admin/set/' + req.params.setid);
                });
            }
            else {
                var name = set.name;
                var code = set.code;
                var gathererCode = set.gathererCode;
                var oldCode = set.oldCode;
                var magicCardsInfoCode = set.magicCardsInfoCode;
                var releaseDate = set.releaseDate;
                var type = set.type;
                var block = set.block;
                var onlineOnly = set.onlineOnly;
                var cards = set.cards;

                var _border;
                var _setType;

                sequelize.transaction(function (transaction) {

                    return findOrCreateSetBorder(set, transaction)
                        .then(function (border) {
                            _border = border;
                            console.log("borderid:", border.borderid);
                            return findOrCreateSetType(set,transaction);})
                        .then(function(setType) { _setType=setType; console.log("settypeid:", setType.settypeid);});
                }).then(function (newSets) {
                    res.redirect('/admin/set/' + existingSet.setid);
                }).catch(function (err) {
                    req.flash('errors', {msg: JSON.stringify(err)});
                    req.session.save(function () {
                        res.redirect('/admin/set/' + existingSet.setid);
                    });
                });
            }
        });
    }
};

function findOrCreateSetBorder(set, transaction) {
    return models.Border.findOrCreate({
        where: {
            description: set.border
        },
        transaction: transaction
    })
        .spread(function (border, created) {
            return border;
        });
}

function findOrCreateSetType(set, transaction) {
    return models.SetType.findOrCreate({
        where: {
            description: set.type
        },
        transaction: transaction
    })
        .spread(function (setType, created) {
            return setType;
        });
}

function findOrCreateColorHashtable(cards) {
    var colorsFromFile = [];
    for (var i = 0; i < cards.length; i++) {

    }
}
