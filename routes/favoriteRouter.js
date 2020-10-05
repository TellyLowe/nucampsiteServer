const express = require('express');
const Favorite = require('../models/favorite');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { request } = require('express');
const favoriteRouter = express.Router();



favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({
            user: req.user._id
        })
            .populate('user').populate('campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (favorite.campsite.forEach(x => x.id !== req.campsite._id)) {
                        favorite.campsites.push(req.campsite)
                        favorite.save()
                            .then(favorite => {
                                console.log('Favorite Created ', favorite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            }).catch(err => next(err));
                    }
                } else {
                    Favorite.create({user: req.user._id, campsite: req.user.campsite._id})
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndDelete(req.params.favoriteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /favorites/${req.params.favoriteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findById(req.params.favoriteId)
        .then(favorite => {
            if (favorite) {
                if (favorite.campsite.forEach(x => x.id !== req.campsite._id)) {
                    favorite.campsites.push(req.campsite)
                    favorite.save()
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }).catch(err => next(err));
                }
            } else if (!favorite) {
                console.log('That campsite is already in the list of favorites!', favorite);
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            } else {
                Favorite.create({user: req.user._id, campsite: req.user.campsite._id})
                    .then(favorite => {
                        console.log('Favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            }
        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, { new: true })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndDelete(req.params.favoriteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });    