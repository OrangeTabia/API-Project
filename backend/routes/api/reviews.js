const express = require('express');
const { Spot, User, Review, SpotImage, ReviewImage } = require('../../db/models'); 
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
        }
    });

    let formattedReviews = await Promise.all(currentReviews.map(async (review) => {
        const firstImage = await SpotImage.findOne({
            where: {
                spotId: review.spotId,
                preview: true
            }
        }); 
        const currentSpot = await Spot.findByPk(review.spotId, {
            attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
        });
        const currentReviewImages = await ReviewImage.findAll({
            where: {
                reviewId: review.id
            }, 
            attributes: ['id', 'url']
        }); 

        return {
            ...review.dataValues, 
            Spot: {
                ...currentSpot.dataValues, 
                previewImage: firstImage?.url
            },
            User: {
                id: user.id, 
                firstName: user.firstName,
                lastName: user.lastName
            },
            ReviewImages: currentReviewImages
        }
    }))

    res.json({
        Reviews: formattedReviews
    }); 
});

// ADD IMAGE TO REVIEW BASED ON REVIEW ID
router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const reviewId = req.params.reviewId;
    const { user } = req; 
    const { url } = req.body; 
    const review = await Review.findByPk(reviewId);
    const existingImages = await ReviewImage.findAll({
        where: {
            reviewId
        }
    }); 
    
    // Review must exist
    if (review) {
        // Review must belong to this user
        if (user.id === review.dataValues.userId) {

            // Review must not be at the limit for content
            if (existingImages.length < 10) {

                const newImage = await ReviewImage.create({
                    url,
                    reviewId
                }); 

                await newImage.save();

                res.status(200); 
                res.json({
                    id: newImage.id, 
                    url
                });

            } else {
                res.status(403);
                res.json({
                    message: 'Maximum number of images for this resource was reached'
                }); 
            }

        } else {
            res.status(403); 
            res.json({
                message: 'Forbidden'
            }); 
        }

    } else {
        res.status(404);
        res.json({
            message: `Review with an id of ${reviewId} could not be found`
        }); 
    }
});


// Middleware to handle body validation errors to editing reviews
const validateEditReview = [
    check('review')
      .exists({ checkFalsy: true })
      .withMessage('Review text is required'),
    check('stars')
      .exists({ checkFalsy: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
  ]; 


// EDIT A REVIEW
router.put('/:reviewId', [requireAuth, validateEditReview], async (req, res) => {

    const reviewId = req.params.reviewId;
    const editedReview = await Review.findByPk(reviewId); 
    const { user } = req;
    const { review, stars } = req.body;

    if (editedReview) {
        if (user.id === editedReview.dataValues.userId) {

            editedReview.review = review;
            editedReview.stars = stars;

            await editedReview.save();

            res.json(editedReview); 

        } else {
            res.status(403);
            res.json({
                message: 'Forbidden'
            }); 
        }
    } else {
        res.status(404); 
        res.json({
            message: `Review with an id of ${reviewId} could not be found`
        }); 
    }
});

// DELETE REVIEW
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const reviewId = req.params.reviewId;
    const review = await Review.findByPk(reviewId); 
    const { user } = req;

    if (review) {
        if (user.id === review.dataValues.userId) {

            review.destroy(); 
            res.json({
                message: 'Successfully deleted'
            }); 
            
        } else {
            res.status(403); 
            res.json({
                message: 'Forbidden'
            }); 
        }
    } else {
        res.status(404);
        res.json({
            message: `Review with an id of ${reviewId} could not be found`
        }); 
    }
});


module.exports = router;