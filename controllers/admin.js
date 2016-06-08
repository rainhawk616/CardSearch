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
        app.get('/admin/set/import', this.getSetImport);
        app.post('/admin/set/import', upload.single("setsimport"), this.postSetImport);
        app.get('/admin/set/:setid', this.set);

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
                ['releasedate', 'ASC']
            ]
        }).then(function (sets) {
            res.render('admin/sets', {
                title: 'Sets',
                sets: sets
            });
        });
    },
    set: function (req, res, next) {
        models.Set.findById(req.params.setid, {
            include: [
                {
                    model: models.Border
                },
                {
                    model: models.Printing,
                    include: [
                        {
                            model: models.Card
                        }, {
                            model: models.Rarity
                        }
                    ]
                }
            ],
            order: [
                [models.Printing, 'number', 'ASC'],
                [models.Printing, models.Card, 'name', 'ASC']
            ]
        }).then(function (set) {
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
    getSetImport: function (req, res, next) {
        res.render('admin/setimport', {
            title: 'Set Import'
        });
    },
    postSetImport: function (req, res, next) {
        var content = fs.readFileSync(req.file.path);
        var setJson = JSON.parse(content);

        if (setJson.hasOwnProperty('LEA')) {

            var sequence = Promise.resolve();
            var i = 0;
            var d = 0;

            for (var setCode in setJson) {
                if (setJson.hasOwnProperty(setCode)) {
                    var set = setJson[setCode];
                    (function (innerSet) {
                        sequence = sequence.then(function () {
                            console.log('importing ' + innerSet.code);
                            return findOrCreateSet(innerSet);
                        }).spread(function (resultSet, created) {
                            if (created)
                                i++;
                            else
                                d++;
                        });
                    }(set));
                }
            }

            sequence.then(function (results) {
                req.flash('success', {msg: i + ' sets created (' + d + ' duplicates'});
                req.session.save(function () {
                    res.redirect('/admin/sets');
                });
            }).catch(function (err) {
                console.log(err);
                req.flash('errors', {msg: "An error occured while adding the new set."});
                req.session.save(function () {
                    res.redirect('/admin/set/import');
                });
            });
        }
        else {
            findOrCreateSet(setJson)
                .spread(function (set, created) {
                    if (!created) {
                        req.flash('warning', {msg: setJson.name + ' (' + setJson.code + ') has already been imported'});
                        req.session.save(function () {
                            res.redirect('/admin/set/import');
                        });
                    }
                    else {
                        req.flash('success', {msg: setJson.name + ' (' + setJson.code + ') created'});
                        req.session.save(function () {
                            //TODO redirect to sets
                            //res.redirect('/admin/sets');
                            res.redirect('/admin/set/import');
                        });
                    }
                }).catch(function (err) {
                console.log(err);
                req.flash('errors', {msg: "An error occured while adding the new set."});
                req.session.save(function () {
                        res.redirect('/admin/set/import');
                    }
                );
            });
        }
    }
};

function findOrCreateType(model, where, transaction) {
    if (!where || !where.hasOwnProperty('description') || !where.description)
        return null;

    return model.findOrCreate({where: where, transaction: transaction}).spread(function (foundOrNewEntity, created) {
        return foundOrNewEntity;
    });
}

function findOrCreateTypeMap(model, map, transaction) {
    var promises = [];
    for (var key in map) {
        if (map.hasOwnProperty(key))
            promises.push(findOrCreateType(model, {description: key}, transaction));
    }

    return Promise.all(promises).then(function (results) {
        var findOrCratedMap = {};
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            findOrCratedMap[result.description] = result;
        }
        return findOrCratedMap;
    });
}

function findOrCreateSet(setJson, success, error) {
    /*
     New values
     */
    var _set;
    var _border;
    var _setType;
    var _block;
    var _cards;
    var _colorIdentityMap;
    var _colorMap;
    var _layoutMap;
    var _formatMap;
    var _legalityMap;
    var _manaMap;
    var _rarityMap;
    var _supertypeMap;
    var _typeMap;
    var _subtypeMap;
    var _languageMap;
    var _watermarkMap;

    for (var setField in setJson) {
        if (setJson.hasOwnProperty(setField)) {
            if (setField !== 'name'
                && setField !== 'code'
                && setField !== 'code'
                && setField !== 'gathererCode'
                && setField !== 'magicCardsInfoCode'
                && setField !== 'releaseDate'
                && setField !== 'border'
                && setField !== 'type'
                && setField !== 'booster'
                && setField !== 'mkm_name'
                && setField !== 'mkm_id'
                && setField !== 'cards'
                && setField !== 'block'
                && setField !== 'translations' //TODO set translations not implemented
                && setField !== 'magicRaritiesCodes' //TODO set magicRaritiesCodes not implemented
                && setField !== 'oldCode'
                && setField !== 'onlineOnly'
            ) {
                throw new Error("Unsupported set field " + setField + " found. (" + JSON.stringify(setField) + ":" + JSON.stringify(setJson[setField]) + ")")
            }
        }
    }

    return models.Set.findAll({
        where: {
            name: setJson.name
        }
    }).then(function (sets) {
        if (sets.length > 0) {
            return [sets[0], false];
        }
        else {
            var cards = setJson.cards;
            var colorIdentityMap = {};
            var colorMap = {};
            var layoutMap = {};
            var formatMap = {};
            var legalityMap = {};
            var manaMap = {};
            var rarityMap = {};
            var subtypeMap = {};
            var typeMap = {};
            var supertypeMap = {};
            var languageMap = {};
            var watermarkMap = {};

            for (var index = 0; index < cards.length; index++) {
                var card = cards[index];

                for (var cardField in card) {
                    if (card.hasOwnProperty(cardField)) {
                        /*
                         Discover type fields
                         */
                        var i = 0;
                        if (cardField == 'colorIdentity') {
                            for (i = 0; i < card[cardField].length; i++) {
                                colorIdentityMap[card[cardField][i]] = null;
                            }
                        }
                        else if (cardField == 'colors') {
                            for (i = 0; i < card[cardField].length; i++) {
                                colorMap[card[cardField][i]] = null;
                            }
                        }
                        else if (cardField == 'layout') {
                            layoutMap[card[cardField]] = null;
                        }
                        else if (cardField == 'legalities') {
                            for (i = 0; i < card[cardField].length; i++) {
                                formatMap[card[cardField][i]['format']] = null;
                                legalityMap[card[cardField][i]['legality']] = null;
                            }
                        }
                        else if (cardField == 'manaCost') {
                            var symbols = card[cardField];
                            var symbolRegex = /({[^{}]+})/g;
                            var mana;
                            while (mana = symbolRegex.exec(symbols)) {
                                manaMap[mana[0]] = null;
                            }
                        }
                        else if (cardField == 'rarity') {
                            rarityMap[card[cardField]] = null;
                        }
                        else if (cardField == 'watermark') {
                            watermarkMap[card[cardField]] = null;
                        }
                        else if (cardField == 'subtypes') {
                            for (i = 0; i < card[cardField].length; i++) {
                                subtypeMap[card[cardField][i]] = null;
                            }
                        }
                        else if (cardField == 'types') {
                            for (i = 0; i < card[cardField].length; i++) {
                                typeMap[card[cardField][i]] = null;
                            }
                        }
                        else if (cardField == 'supertypes') {
                            for (i = 0; i < card['supertypes'].length; i++) {
                                supertypeMap[card['supertypes'][i]] = null;
                            }
                        }
                        else if (cardField == 'foreignNames') {
                            for (i = 0; i < card['foreignNames'].length; i++) {
                                languageMap[card['foreignNames'][i]['language']] = null;
                            }
                        }
                        else if (cardField == 'artist'
                            || cardField === 'cmc'
                            || cardField === 'flavor'
                            || cardField === 'id'
                            || cardField === 'imageName'
                            || cardField === 'mciNumber'
                            || cardField === 'multiverseid'
                            || cardField === 'name'
                            || cardField === 'originalText'
                            || cardField === 'originalType'
                            || cardField === 'power'
                            || cardField === 'printings'
                            || cardField === 'text'
                            || cardField === 'toughness'
                            || cardField === 'type'
                            || cardField === 'reserved'
                            || cardField === 'rulings'
                            || cardField === 'variations'
                            || cardField === 'source'
                            || cardField === 'number'
                            || cardField === 'releaseDate'
                            || cardField === 'border' //TODO should this be a type?
                            || cardField === 'loyalty'
                            || cardField === 'names'
                            || cardField === 'starter'
                            || cardField === 'timeshifted'
                            || cardField === 'hand'
                            || cardField === 'life'
                        ) {
                            //Simple fields
                        }
                        else {
                            throw new Error("Unsupported card field " + cardField + " found. (" + JSON.stringify(cardField) + ":" + JSON.stringify(card[cardField]) + ")")
                        }
                    }
                }
            }

            return sequelize.transaction(function (transaction) {
                //"border": "black"
                var borderPromise = findOrCreateType(models.Border, {description: setJson.border}, transaction);

                //"type": "core"
                var setTypePromise = findOrCreateType(models.SetType, {description: setJson.type}, transaction);

                //block
                var blockPromise = findOrCreateType(models.Block, {description: setJson.block}, transaction);

                //color identity
                var colorIdentityPromise = findOrCreateTypeMap(models.ColorIdentity, colorIdentityMap, transaction);

                //color
                var colorPromise = findOrCreateTypeMap(models.Color, colorMap, transaction);

                //layout
                var layoutPromise = findOrCreateTypeMap(models.Layout, layoutMap, transaction);

                //format
                var formatPromise = findOrCreateTypeMap(models.Format, formatMap, transaction);

                //legality
                var legalityPromise = findOrCreateTypeMap(models.Legality, legalityMap, transaction);

                //mana
                var manaPromise = findOrCreateTypeMap(models.Mana, manaMap, transaction);

                //rarity
                var rarityPromise = findOrCreateTypeMap(models.Rarity, rarityMap, transaction);

                //supertype
                var supertypePromise = findOrCreateTypeMap(models.Supertype, supertypeMap, transaction);

                //type
                var typePromise = findOrCreateTypeMap(models.Type, typeMap, transaction);

                //subtype
                var subtypePromise = findOrCreateTypeMap(models.Subtype, subtypeMap, transaction);

                //language
                var languagePromise = findOrCreateTypeMap(models.Language, languageMap, transaction);

                //language
                var watermarkPromise = findOrCreateTypeMap(models.Watermark, watermarkMap, transaction);

                return Promise.all([borderPromise, setTypePromise, blockPromise, colorIdentityPromise, colorPromise, layoutPromise, formatPromise, legalityPromise, manaPromise, rarityPromise, supertypePromise, typePromise, subtypePromise, languagePromise, watermarkPromise])
                    .spread(function (border, setType, block, colorIdentityMap, colorMap, layoutMap, formatMap, legalityMap, manaMap, rarityMap, supertypeMap, typeMap, subtypeMap, languageMap, watermarkMap) {
                        _border = border;
                        _setType = setType;
                        _block = block;
                        _colorIdentityMap = colorIdentityMap;
                        _colorMap = colorMap;
                        _layoutMap = layoutMap;
                        _formatMap = formatMap;
                        _legalityMap = legalityMap;
                        _manaMap = manaMap;
                        _rarityMap = rarityMap;
                        _supertypeMap = supertypeMap;
                        _typeMap = typeMap;
                        _subtypeMap = subtypeMap;
                        _languageMap = languageMap;
                        _watermarkMap = watermarkMap;

                        var newSet = models.Set.build({
                            name: setJson.name,
                            code: setJson.code,
                            gathererCode: setJson.gathererCode,
                            magicCardsInfoCode: setJson.magicCardsInfoCode,
                            releaseDate: setJson.releaseDate,
                            mkm_name: setJson.mkm_name,
                            mkm_id: setJson.mkm_id,
                            starter: setJson.starter,
                            oldcode: setJson.oldCode,
                            onlineOnly: setJson.onlineOnly
                        });

                        newSet.setBorder(border, {save: false});
                        newSet.setSetType(setType, {save: false});
                        newSet.setBlock(block, {save: false});

                        return newSet.save({transaction: transaction});
                    }).then(function (newSet) {
                        _set = newSet;

                        var promises = [];
                        for (var i = 0; i < cards.length; i++) {
                            promises.push(findOrCreateCard(transaction, newSet, cards[i], _layoutMap, _colorIdentityMap, _colorMap, _formatMap, _legalityMap, _supertypeMap, _typeMap, _subtypeMap, _languageMap, _rarityMap, _watermarkMap));
                        }
                        return Promise.all(promises);
                    });
                // .then(function (cards) {
                //     _cards = cards;
                // })
            }).then(function () {
                return [_set, true];
            });
        }
    });
}

function findOrCreateCard(transaction, set, cardJson, layoutMap, colorIdentityMap, colorMap, formatMap, legalityMap, supertypeMap, typeMap, subtypeMap, languageMap, rarityMap, watermarkMap) {
    var _card;

    return models.Card.findOrCreate({
        where: {name: cardJson.name},
        defaults: {
            manaCost: cardJson.manaCost,
            cmc: cardJson.cmc,
            power: cardJson.power,
            text: cardJson.text,
            toughness: cardJson.toughness,
            reserved: cardJson.reserved,
            loyalty: cardJson.loyalty,
            hand: cardJson.hand,
            life: cardJson.life,
//TODO jsonb
            colorIdentity: cardJson.colorIdentity,
            legalities: cardJson.legalities,
            printings: cardJson.printings,
            supertypes: cardJson.supertypes,
            types: cardJson.types,
            subtypes: cardJson.subtypes,
            names: cardJson.names
        },
        transaction: transaction
    }).spread(function (card, created) {
        _card = card;

        var promises = [];
        var i;

        if (created) {
            /*
             Layout
             */
            if (!layoutMap.hasOwnProperty(cardJson.layout))
                throw new Error(cardJson.layout + " not present in layoutMap");
            promises.push(card.setLayout(layoutMap[cardJson.layout], {transaction: transaction}));

            /*
             Color Identities
             */
            if (cardJson.hasOwnProperty('colorIdentity')) {
                var colorIdentities = cardJson.colorIdentity;
                for (i = 0; i < colorIdentities.length; i++) {
                    var colorIdentityKey = colorIdentities[i];
                    if (!colorIdentityMap.hasOwnProperty(colorIdentityKey))
                        throw new Error(colorIdentityKey + " not present in colorIdentityMap");
                    var colorIdentity = colorIdentityMap[colorIdentityKey];
                    var cardColorIdentity = models.CardColorIdentity.build();
                    cardColorIdentity.setCard(card, {save: false});
                    cardColorIdentity.setColorIdentity(colorIdentity, {save: false});
                    promises.push(cardColorIdentity.save({transaction: transaction}));
                }
            }

            /*
             Color
             */
            if (cardJson.hasOwnProperty('color')) {
                var colors = cardJson.color;
                for (i = 0; i < colors.length; i++) {
                    var colorKey = colors[i];
                    if (!colorMap.hasOwnProperty(colorKey))
                        throw new Error(colorKey + " not present in colorMap");
                    var color = colorMap[colorKey];
                    var cardColor = models.CardColor.build();
                    cardColor.setCard(card, {save: false});
                    cardColor.setColor(color, {save: false});
                    promises.push(cardColor.save({transaction: transaction}));
                }
            }

            /*
             Legalities
             */
            if (cardJson.hasOwnProperty('legalities')) {
                var legalities = cardJson.legalities;
                for (i = 0; i < legalities.length; i++) {
                    var legalityJson = legalities[i];
                    var formatKey = legalityJson.format;
                    var legalityKey = legalityJson.legality;
                    if (!formatMap.hasOwnProperty(formatKey))
                        throw new Error(formatKey + " not present in formatMap");
                    if (!legalityMap.hasOwnProperty(legalityKey))
                        throw new Error(legalityKey + " not present in colorMap");
                    var format = formatMap[formatKey];
                    var legality = legalityMap[legalityKey];
                    var cardLegality = models.CardLegality.build();
                    cardLegality.setCard(card, {save: false});
                    cardLegality.setFormat(format, {save: false});
                    cardLegality.setLegality(legality, {save: false});
                    promises.push(cardLegality.save({transaction: transaction}));
                }
            }

            /*
             Supertype
             */
            if (cardJson.hasOwnProperty('supertypes')) {
                var supertypes = cardJson.supertypes;
                for (i = 0; i < supertypes.length; i++) {
                    var supertypeKey = supertypes[i];
                    if (!supertypeMap.hasOwnProperty(supertypeKey))
                        throw new Error(supertypeKey + " not present in supertypeMap");
                    var supertype = supertypeMap[supertypeKey];
                    var cardSupertype = models.CardSupertype.build();
                    cardSupertype.setCard(card, {save: false});
                    cardSupertype.setSupertype(supertype, {save: false});
                    promises.push(cardSupertype.save({transaction: transaction}));
                }
            }

            /*
             Type
             */
            if (cardJson.hasOwnProperty('types')) {
                var types = cardJson.types;
                for (i = 0; i < types.length; i++) {
                    var typeKey = types[i];
                    if (!typeMap.hasOwnProperty(typeKey))
                        throw new Error(typeKey + " not present in typeMap");
                    var type = typeMap[typeKey];
                    var cardType = models.CardType.build();
                    cardType.setCard(card, {save: false});
                    cardType.setType(type, {save: false});
                    promises.push(cardType.save({transaction: transaction}));
                }
            }

            /*
             Subtype
             */
            if (cardJson.hasOwnProperty('subtypes')) {
                var subtypes = cardJson.subtypes;
                for (i = 0; i < subtypes.length; i++) {
                    var subtypeKey = subtypes[i];
                    if (!subtypeMap.hasOwnProperty(subtypeKey))
                        throw new Error(subtypeKey + " not present in subtypeMap");
                    var subtype = subtypeMap[subtypeKey];
                    var cardSubtype = models.CardSubtype.build();
                    cardSubtype.setCard(card, {save: false});
                    cardSubtype.setSubtype(subtype, {save: false});
                    promises.push(cardSubtype.save({transaction: transaction}));
                }
            }

            /*
             Rulings
             */
            if (cardJson.hasOwnProperty('rulings')) {
                var rulings = cardJson.rulings;
                for (i = 0; i < rulings.length; i++) {
                    var ruling = rulings[i];
                    var cardRuling = models.CardRuling.build({
                        date: ruling.date,
                        text: ruling.text
                    });
                    cardRuling.setCard(card, {save: false});
                    promises.push(cardRuling.save({transaction: transaction}));
                }
            }

            /*
             Alternate name (flip, transform)
             */
            if (cardJson.hasOwnProperty('names')) {
                var names = cardJson.names;
                for (i = 0; i < names.length; i++) {
                    var name = names[i];
                    var cardName = models.CardName.build({
                        name: name
                    });
                    cardName.setCard(card, {save: false});
                    promises.push(cardName.save({transaction: transaction}));
                }
            }
        }
        else {
            /*
            The card already exists but we should update the printings just in case the card got a new one
             */
            card.printings = cardJson.printings;
            promises.push(card.save({transaction:transaction}));
        }

        return Promise.all(promises);
    }).then(function (results) {
        var printing = models.Printing.build({
            artist: cardJson.artist,
            flavor: cardJson.flavor,
            id: cardJson.id,
            imageName: cardJson.imageName,
            mciNumber: cardJson.mciNumber,
            multiverseid: cardJson.multiverseid,
            originalText: cardJson.originalText,
            originalType: cardJson.originalType,
            type: cardJson.type,
            number: cardJson.number,
            releaseDate: cardJson.releaseDate,
            border: cardJson.border,
            source: cardJson.source,
            timeshifted: cardJson.timeshifted,
            //TODO jsonb
            foreignNames: cardJson.foreignNames
        });

        printing.setCard(_card, {save: false});
        printing.setSet(set, {save: false});

        if (cardJson.hasOwnProperty('rarity')) {
            var rarityKey = cardJson.rarity;
            if (!rarityMap.hasOwnProperty(rarityKey))
                throw new Error(rarityKey + " not present in rarityMap");
            var rarity = rarityMap[rarityKey];
            printing.setRarity(rarity, {save: false});
        }

        if (cardJson.hasOwnProperty('watermark')) {
            var watermarkKey = cardJson.watermark;
            if (!watermarkMap.hasOwnProperty(watermarkKey))
                throw new Error(watermarkKey + " not present in watermarkMap");
            var watermark = watermarkMap[watermarkKey];
            printing.setWatermark(watermark, {save: false});

        }

        return printing.save({transaction: transaction});
    }).then(function (printing) {

        var promises = [];

        /*
         Foreign name
         */
        if (cardJson.hasOwnProperty('foreignNames')) {
            var foreignNames = cardJson.foreignNames;
            for (i = 0; i < foreignNames.length; i++) {
                var foreignName = foreignNames[i];
                var languageKey = foreignName.language;
                if (!languageMap.hasOwnProperty(languageKey))
                    throw new Error(languageKey + " not present in languageMap");
                var language = languageMap[languageKey];
                var printingForeignName = models.PrintingForeignName.build({
                    name: foreignName.name
                });
                printingForeignName.setPrinting(printing, {save: false});
                printingForeignName.setLanguage(language, {save: false});
                promises.push(printingForeignName.save({transaction: transaction}));
            }
        }

        return Promise.all(promises);
    });
}
