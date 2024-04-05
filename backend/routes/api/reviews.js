const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage, Booking, ReviewImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// GET ALL REVIEWS OF THE CURRENT USER
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    const currentReviews = await Review.findAll({
        where: {
            userId: user.id
        }, 
        include: [
            {model: User, attributes: ['id', 'firstName', 'lastName']}, 
            {model: Spot, attributes: {exclude: ['description', 'createdAt', 'updatedAt']}}, 
            {model: ReviewImage, attributes: {exclude: ['reviewId', 'createdAt', 'updatedAt']}}
        ]
    });

    let formattedReviews = await Promise.all(currentReviews.map(async (review) => {
        const firstImage = await SpotImage.findOne({
            where: {
                spotId: review.Spot.id,
                preview: true
            }
        }); 

        return {
            ...review.dataValues, 
            Spot: {
                ...review.Spot.dataValues, 
                previewImage: firstImage?.url
            }
        }
    }))

    res.json({
        Reviews: formattedReviews
    }); 
});


// GET ALL REVIEWS BY A SPOT'S ID



module.exports = router;