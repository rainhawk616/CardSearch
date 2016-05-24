var models = require("../models/");
var sequelize = require('../models/index').sequelize;
var Sequelize = require('../models/index').Sequelize;
var Promise = require("bluebird");

module.exports = {
    registerRoutes: function (app, passportConfig) {
        app.get('/user/dashboard', passportConfig.isUserAuthorized, this.dashboard);
        app.get('/user/products', passportConfig.isUserAuthorized, this.products);
        app.get('/user/product', passportConfig.isUserAuthorized, this.productcreate);
        app.post('/user/product', passportConfig.isUserAuthorized, this.productcreatepost);
        app.get('/user/product/:productid', passportConfig.isUserAuthorized, this.product);
    },
    dashboard: function (req, res, next) {
        res.render('user/dashboard', {
            title: 'Dashboard'
        });
    },
    products: function (req, res, next) {
        models.UserProduct.findAll({
            include: [
                {
                    model: models.UserProductResult,
                    include: [models.Result]
                },
                models.Product
            ],
            where: {
                'userid': req.user.userid
            },
            order: [
                [models.Product, 'name', 'DESC']
            ]
        }).then(function (userProducts) {
            res.render('user/products', {
                title: 'Products',
                userProducts: userProducts
            });
        });
    },
    product: function (req, res, next) {
        var productid = req.params.productid;
        res.render('user/product', {
            title: "Product"
        });
    },
    productcreate: function (req, res, next) {
        sequelize.Promise.all([
            models.Result.findAll(),
            models.Brand.findAll()
        ]).spread(function (results, brands) {
            res.render('user/productcreate', {
                title: "Product",
                results: results,
                brands: brands
            });
        });
    },
    productcreatepost: function (req, res, next) {

        console.log("productcreatepost:", req.body);

        req.check('name', 'Name is required').notEmpty();
        if (req.body.newBrand) {
            req.check('newBrand', 'New brand name is required').notEmpty();
        }
        else {
            req.check('brand', 'Brand is required').isInt();
        }
        req.check('ingredients', 'Ingredients are required').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            req.session.save(function () {
                return res.redirect('/user/product');
            });
        }
        else {

            var used = req.body.used === 'on';
            var good = req.body.good === 'true' ? true : req.body.good === 'false' ? false : null;
            var normalizedIngredients = [];
            var ingredientsPaste = req.body.ingredients.split(",");
            for (var i = 0; i < ingredientsPaste.length; i++) {
                var name = ingredientsPaste[i].trim();
                if (name !== '') {
                    normalizedIngredients.push(name);
                    console.log("ingredient:", name);
                }
            }

            var _ingredients = [];
            var _brand;
            var _product;
            var _productIngredients;

            sequelize.transaction(function (transaction) {
                return Promise.map(normalizedIngredients, function (item, index, length) {
                    return models.Ingredient.findOrCreate({
                        where: {
                            name: item,
                            approved: false
                        },
                        transaction: transaction
                    });
                }, {
                    concurrency: 1
                }).then(function (ingredientFindOrCreateResponse) {
                    for (var i = 0; i < ingredientFindOrCreateResponse.length; i++) {
                        var ingredient = ingredientFindOrCreateResponse[i][0];
                        var created = ingredientFindOrCreateResponse[i][1];
                        _ingredients.push(ingredient);
                    }

                    for (var i = 0; i < _ingredients.length; i++) {
                        console.log("_ingredients[" + i + "].ingredientid:", _ingredients[i].ingredientid);
                    }

                    if (req.body.newBrand) {
                        return models.Brand.findOrCreate({
                            where: {
                                name: req.body.newBrand,
                                approved: false
                            },
                            transaction: transaction
                        });
                    }
                    else {
                        return models.Brand.findById(req.body.brand, {
                            transaction: transaction
                        });
                    }
                }).then(function (brand) {
                    console.log("brand:", brand);
                    console.log("brand:", JSON.stringify(brand));
                    if (brand.length)
                        _brand = brand[0];
                    else
                        _brand = brand;

                    console.log("_brand.brandid:", _brand.brandid);

                    var newProduct = models.Product.build({
                        name: req.body.name,
                        description: req.body.description,
                        approved: false
                    });

                    newProduct.setBrand(_brand, {save: false});

                    return newProduct.save({transaction: transaction});
                }).then(function (product) {
                    _product = product;

                    console.log("product.productid:", product.productid);

                    return Promise.map(_ingredients, function (ingredient, index, length) {
                        var productIngredient = models.ProductIngredient.build({});

                        productIngredient.setProduct(_product, {save: false});
                        productIngredient.setIngredient(ingredient, {save: false});

                        return productIngredient.save({transaction: transaction});
                    }, {
                        concurrency: 1
                    });
                }).then(function (productIngredients) {
                    _productIngredients = productIngredients;

                    console.log("productIngredients:", JSON.stringify(productIngredients));

                    for (var i = 0; i < _productIngredients.length; i++) {
                        console.log("_productIngredients[" + i + "].productingredientid:", _productIngredients[i].productingredientid);
                    }

                    var userProduct = models.UserProduct.build({
                        used: used,
                        good: good
                    });

                    userProduct.setUser(req.user, {save: false});
                    userProduct.setProduct(_product, {save: false});

                    return userProduct.save({transaction: transaction});
                }).then(function (userProduct) {
                    _userProduct = userProduct;

                    console.log("_userProduct.userproductid:", _userProduct.userproductid);
                })
            }).then(function (result) {
                req.flash('success', {msg: 'Success!'});
                req.session.save(function () {
                    res.redirect('/user/products');
                });
            }).catch(function (err) {
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback

                console.log("err:", err);

                req.flash('errors', {msg: "An error occured while adding your product."});
                req.session.save(function () {
                    res.redirect('/user/product');
                });
            });
        }
    }
};