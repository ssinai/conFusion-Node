const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions,(req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .populate('user')
  .populate('dishes')
  .then ((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOneAndUpdate({user:req.user._id}, {}, {new: true, upsert: true})
  .then ((favorite) => {
      favs = req.body;

      // Only add if favorite doesn't exist
      favs.forEach(function(item) {
          if (favorite.dishes.indexOf(item["_id"]) == -1) {
            favorite.dishes.push(item["_id"]);
          }
      });

      favorite.save()
      .then((favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOneAndDelete({user: req.user._id})
  .then ((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      }, (err) => next(err))
      .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOneAndUpdate({user:req.user._id}, {}, {new: true, upsert: true})
  .then ((favorite) => {
    if (favorite.dishes.indexOf(req.params.dishId) == -1) {
      favorite.dishes.push(req.params.dishId);
    }
      favorite.save()
      .then((favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user._id})
  .then ((favorite) => {
    if (favorite.dishes.indexOf(req.params.dishId) > -1) {
      favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
    }
    favorite.save()
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
  .catch((err) => next(err));
  })
});




module.exports = favoriteRouter;
