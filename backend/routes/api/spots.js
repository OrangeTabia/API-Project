const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage, Booking, ReviewImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors, validateLogin } = require('../../utils/validation');
const { format } = require('sequelize/lib/utils');
const router = express.Router();


// Middleware to validate query parameters
const validateQueryParams = [
    check('page')
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 10})
      .withMessage('Page must be greater than or equal to 1'),
    check('size')
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 20 })
      .withMessage('Size must be greater than or equal to 1'),
    check('minLat')
      .optional({ checkFalsy: true })
      .isFloat({ min: -90 })
      .withMessage('Minimum latitude is invalid'),
    check('maxLat')
      .optional({ checkFalsy: true })
      .isFloat({ max: 90 })
      .withMessage('Maximum latitude or invalid'),
    check('minLng')
      .optional({ checkFalsy: true })
      .isFloat({ min: -180 })
      .withMessage('Minimum longitude is invalid'),
    check('maxLng')
      .optional({ checkFalsy: true })
      .isFloat({ max: 180 })
      .withMessage('Maximum longitude is invalid'),
    check('minPrice')
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage('Minimum price must be greater than or equal to 0'),
    check('maxPrice')
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage('Maximum price must be greater than or equal to 0'),
    handleValidationErrors
  ]; 


// GET ALL SPOTS
router.get('/', validateQueryParams, async (req, res) => {

    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

    const pagination = {}; 

    page = parseInt(page);
    size = parseInt(size); 
    minLat = parseInt(minLat); 
    maxLat = parseInt(maxLat); 
    minLng = parseInt(minLng); 
    maxLng = parseInt(maxLng); 
    minPrice = parseInt(minPrice); 
    maxPrice = parseInt(maxPrice); 

    if (!page || (Number.isNaN(page)) || page < 1) page = 1;
    if (!size || (Number.isNaN(size)) || size < 1) size = 20;

    if (page > 0 && page <= 10 && size > 0 && size <= 20) {
        pagination.limit = size;
        pagination.offset = size * (page - 1); 
    }


    const allSpots = await Spot.findAll({
        ...pagination
    }); 


    let formattedSpots =  await Promise.all(allSpots.map(async (spot) => { 
        // This is for the aggregated query over the average stars 
        const spotRating = await Review.findOne({
            where: {
                spotId: spot.id,
            },
            attributes: [
                'spotId',
                [
                    Sequelize.fn("AVG", Sequelize.col("stars")), 
                    "avgRating"
                ],
                
            ],
            group: ['spotId']
        });

        // Now grab the SpotImage that is the primary image for the spot
        const spotImg = await SpotImage.findOne({
            where: {
                spotId: spot.id,
                preview: true    
            },
            attributes: ['url']
        }); 

        // Now calculate the average rating
        let avgRating = 0;
        if (spotRating) { 
            avgRating = Math.floor(spotRating.dataValues.avgRating * 2) / 2
        }



        // Unpack attributes
        const {id, ownerId, address, city, state, country, lat, lng, name, description, price} = spot;

        // Formats the date
        let findCreatedAt = spot.dataValues.createdAt; 
        let formattedCreatedAt = findCreatedAt.toISOString().split(".")[0].replace('T', ' '); 
    
    
        let findUpdatedAt = spot.dataValues.updatedAt;
        let formattedUpdatedAt = findUpdatedAt.toISOString().split(".")[0].replace('T', ' '); 

        return {
            id,
            ownerId,
            address,
            city,
            state,
            country,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            name,
            description,
            price,
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            avgRating,
            previewImage: spotImg ? spotImg.url : null
        }
    }))
    
    res.json({
        Spots: formattedSpots, 
        page, 
        size
    }); 
}); 


// GET ALL SPOTS OWNED BY THE CURRENT USER
router.get('/current', requireAuth, async (req, res) => {
    const {user} = req;

    const currentUserSpots = await Spot.findAll({
        where: {
            ownerId: user.id
        }
    }); 

    let formattedSpots =  await Promise.all(currentUserSpots.map(async (spot) => {

        const {id, ownerId, address, city, state, country, lat, lng, name, description, price } = spot; 

        const spotRating = await Review.findOne({
            where: {
                spotId: id,
            },
            attributes: [
                'spotId',
                [
                    Sequelize.fn("AVG", Sequelize.col("stars")), 
                    "avgRating"
                ],
                
            ],
            group: ['spotId']
        });

        const spotImg = await SpotImage.findOne({
            where: {
                spotId: spot.id,
                preview: true    
            },
            attributes: ['url']
        });
        
        // Now calculate the average rating
        let avgRating = 0;
        if (spotRating) { 
            avgRating = Math.floor(spotRating.dataValues.avgRating * 2) / 2
        }


        // Formats the date
        let findCreatedAt = spot.dataValues.createdAt; 
        let formattedCreatedAt = findCreatedAt.toISOString().split(".")[0].replace('T', ' '); 
    
    
        let findUpdatedAt = spot.dataValues.updatedAt;
        let formattedUpdatedAt = findUpdatedAt.toISOString().split(".")[0].replace('T', ' '); 


        return {
            id, 
            ownerId, 
            address,
            city,
            state, 
            country,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            name,
            description,
            price,
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            avgRating,
            previewImage: spotImg ? spotImg.url : null
        }
    }));


    res.json({
        Spots: formattedSpots
    }); 
}); 


// GET ALL REVIEWS BY A SPOT'S ID
router.get('/:spotId/reviews', async (req, res) => {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);

    if (spot) {
        const reviews = await Review.findAll({
            where: {
                spotId: spotId
            }
        }); 


        let formattedReviews = await Promise.all(reviews.map(async (review) => {
            const reviewImages = await ReviewImage.findAll({
                where: {
                    reviewId: review.id 
                },
                attributes: ['id', 'url']
            });

            const currentUser = await User.findOne({
                where: {
                    id: spotId
                },
                attributes: ['id', 'firstName', 'lastName']
            });
    
    
            // Format dates
            let createdAt = reviews[0].dataValues.createdAt; 
            let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 
    
    
            let updatedAt = reviews[0].dataValues.updatedAt;
            let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 

            return {
                ...review.dataValues,
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt, 
                User: {
                    ...currentUser.dataValues
                }, 
                ReviewImages: reviewImages
            }
        }));


        res.json({
            Reviews: formattedReviews
        });
        
    } else {
        res.status(404);
        res.json({
            message: `Spot with an id of ${spotId} could not be found`
        });
    }
});


// GET ALL BOOKINGS FOR A SPOT BASED ON THE SPOT'S ID   
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const spotId = req.params.spotId;
    const { user } = req; 
    const spot = await Spot.findByPk(spotId); 

    // Spot exists
    if (spot) { 
        // Owner Logic
        if (user.id === spot.dataValues.ownerId) {
            const ownerBookings = await Booking.findAll({
                where: {
                    spotId: spotId,
                    userId: user.id
                }, 
            }); 

            let ownerFormattedBookings = await Promise.all(ownerBookings.map(async (booking) => {
                const currentOwner = await User.findOne({
                    where: {
                        id: booking.userId
                    },
                    attributes: ['id', 'firstName', 'lastName']
                }); 

                // Format dates for ownerBookings
                let createdAt = booking.dataValues.createdAt; 
                let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 
        
        
                let updatedAt = booking.dataValues.updatedAt;
                let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 

                return {
                    User: currentOwner,
                    ...booking.dataValues,
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt
                }
            })); 


            res.json({
                Bookings: ownerFormattedBookings
            }); 
        } 

        // Guest Logic
        else {
            const guestBookings = await Booking.findAll({
                where: {
                    spotId: spotId,
                }, 
                attributes: ['spotId', 'startDate', 'endDate']
            }); 
    
            res.json(guestBookings); 
        }
    }
    // Spot does not exist
    else {
        res.status(404); 
        res.json({
            message: `Spot with an id of ${spotId} could not be found`
        }); 
    }

});

// Middleware for body validation errors
const validateBookingDates = async (req, res, next) => {
    const { startDate, endDate } = req.body;
    let err = null

    // Checks if startDate exists 
    if (startDate === "" || startDate === null) {
        err = new Error('startDate is required and must be in valid "YYYY-MM-DD" format'); 
        err.status = 400;
        next(err)
    }

    // Checks if endDate exists
    if (endDate === "" || endDate === null) {
        err = new Error('endDate is required and must be in valid "YYYY-MM-DD" format'); 
        err.status = 400;
        next(err)
    }

    // Checks if startDate is in the past
    const date = new Date()
    if (startDate < date.toISOString()) {
        if (!err)  {
            err = new Error('Bad Request'); 
            err.errors = {
                startDate: 'startDate cannot be in the past'
            }
        } else { 
            err.errors.startDate = 'startDate cannot be in the past'
        }
        
    } 
    // Checks if endDate is before the startDate
    if (endDate <= startDate) {

        if (!err)  {
            err = new Error('Bad Request'); 
            err.errors = {
                endDate: "endDate cannot be on or before startDate"
            }
        } else { 
            err.errors.endDate = 'endDate cannot be on or before startDate'
        }
    } 
    if (err){ 
        err.status = 400; 
        next(err)
    } else { 
        next()
    }
}



// CREATE A BOOKING FROM A SPOT BASED ON THE SPOT'S ID
router.post('/:spotId/bookings', [requireAuth, validateBookingDates], async (req, res, next) => {
    const { startDate, endDate } = req.body;


//-------------------------HELPER FUNCTION-------------------------//
// Helper function to find bad booking
const findBadBookings = function(bookings) {
    // Itertate through all of the bookings
    for (let booking of bookings) {
        let existingStart = booking.dataValues.startDate;
        let existingEnd = booking.dataValues.endDate;

        if ((startDate <= existingStart && endDate >= existingEnd) || 
            (startDate >= existingStart && endDate <= existingEnd)) {
                err = new Error('Sorry, this spot is already booked for the specified dates');
                err.status = 403; 
                err.errors = {
                    startDate: 'Start date conflicts with an existing booking', 
                    endDate: 'End date conflicts with an existing booking'
                }
                return err; 
            }

        // DO NOT LET START DATES OVERLAP
        if (existingEnd >= startDate && endDate >= existingEnd) {
            err = new Error('Sorry, this spot is already booked for the specified dates');
            err.status = 403; 
            err.errors = {
                startDate: 'Start date conflicts with an existing booking'
            }
            return err; 
        }

        // DO NOT LET END DATES OVERLAP
        if (existingStart <= endDate && startDate <= existingStart) {
            err = new Error('Sorry, this spot is already booked for the specified dates');
            err.status = 403;
            err.errors = {
                endDate: 'End date conflicts with an existing booking'
            }
            return err; 
        }
    }; 
}
//-------------------------HELPER FUNCTION END------------------------//


    const spotId = req.params.spotId;
    const { user } = req;
    const spot = await Spot.findByPk(spotId); 

    if (spot) {
        if (user.id !== spot.dataValues.ownerId) {
            
            const existingBookings = await Booking.findAll({
                where: {
                    spotId: spotId
                }
            }); 
    
            error = findBadBookings(existingBookings);
            if (error) {
                res.status(403);
                next(error);
            } else {
                const newBooking = await Booking.create({
                    spotId: spotId,
                    userId: user.id,
                    startDate,
                    endDate
                });

                // Format dates
                let createdAt = newBooking.dataValues.createdAt; 
                let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 


                let updatedAt = newBooking.dataValues.updatedAt;
                let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 

                res.status(201);
                res.json({
                    ...newBooking.dataValues,
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt
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
            message: `Spot with an id of ${spotId} could not be found`
        }); 
    }

}); 

// Middleware to handle body validation errors to creating a spot
const validateCreateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
]; 

// CREATE A REVIEW FOR A SPOT BASED ON THE SPOT'S ID   
router.post('/:spotId/reviews', [requireAuth, validateCreateReview], async (req, res) => {
    const spotId = req.params.spotId;
    const { user } = req; 
    const { review, stars } = req.body;

    // Find any existing reviews
    const existingReview = await Review.findOne({
        where: { 
            spotId: spotId,
            userId: user.id,
        }
    }); 

    // If they've already reviewed it, return an error
    if (existingReview) {
        res.status(500);
        res.json({
            message: 'User already has a review for this spot'
        }); 
    } else {
        // Otherwise, if they have a spot, make the review
        const spot = await Spot.findByPk(spotId); 

        if (spot) {
            const newReview = await Review.create({
                userId: user.id,
                spotId: spotId,
                review,
                stars
            });


            //Format dates
            let createdAt = newReview.dataValues.createdAt; 
            let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 
        
        
            let updatedAt = newReview.dataValues.updatedAt;
            let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 


            res.status(201); 
            res.json({
                ...newReview.dataValues,
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
            }); 
            // If the spot doesn't exist, return a 404
        } else {
            res.status(404);
            res.json({
                message: `Spot with an id of ${spotId} could not be found`
            }); 
        }
    }
});


// GET DETAILS OF A SPOT FROM AN ID
router.get('/:spotId', async (req, res) => {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId); 

    if (spot) {
        const {id, ownerId, address, city, state, country, lat, lng, name, description, price } = spot;


        const spotRating = await Review.findOne({
            where: {
                spotId: spot.id,
            },
            attributes: [
                'spotId',
                [   
                    Sequelize.fn("AVG", Sequelize.col("stars")), 
                    "avgRating"
                ],
                [
                    Sequelize.fn("COUNT", Sequelize.col("stars")), 
                    "numReviews"
                ]
                
            ],
            group: ['spotId']
        });


        // Now calculate the average rating + numRatings
        let avgRating= 0;
        let numReviews = 0;
        if (spotRating) { 
            avgRating = Math.floor(spotRating.dataValues.avgRating * 2) / 2
            numReviews = spotRating.dataValues.numReviews
        }        

        // Find our trimmed down images
        let currentImages = await SpotImage.findAll({
            where: {
                spotId: spot.id,
            },
            attributes: ['id', 'url', 'preview']
        });

        // Find our user 
        let currentUser = await User.findByPk(ownerId, {
            attributes: ['id', 'firstName', 'lastName']
        });


        // Format dates
        let findCreatedAt = spot.dataValues.createdAt; 
        let formattedCreatedAt = findCreatedAt.toISOString().split(".")[0].replace('T', ' '); 
    
    
        let findUpdatedAt = spot.dataValues.updatedAt;
        let formattedUpdatedAt = findUpdatedAt.toISOString().split(".")[0].replace('T', ' '); 


        const payload = {
            id, 
            ownerId,
            address,
            city,
            state,
            country,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            name,
            description,
            price,
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            numReviews,
            avgRating,
            SpotImages: currentImages,
            Owner: currentUser
        }
        res.json(payload); 
    } else {
        res.status(404); 
        res.json({
            message: `Spot with an id of ${spotId} could not be found`
        }); 
    }
});


// TODO: Allow folks to put in a SINGLE attribute to update
const validateCreateSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
    check('lat')
      .exists({ checkFalsy: true })
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be within -90 and 90'),
    check('lng')
      .exists({ checkFalsy: true })
      .isFloat({ min: -180, max: 180 })
      .withMessage('Latitude must be within -180 and 180'),
    check('name')
      .exists({ checkFalsy: true })
      .isLength({ max: 50 })
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'), 
    check('price')
      .exists({ checkFalsy: true })
      .isInt({ min: 0})
      .withMessage('Price per day must be a positive number'),
    handleValidationErrors
  ];


// CREATE A SPOT
router.post('/', [requireAuth, validateCreateSpot], async (req, res) => {
    const {address, city, state, country, lat, lng, name, description, price } = req.body; 

    // Grab the user from the request 
    const { user } = req;

    const newSpot = await Spot.create({
        ownerId: user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
    }); 

    // Format dates
    let createdAt = newSpot.dataValues.createdAt; 
    let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 


    let updatedAt = newSpot.dataValues.updatedAt;
    let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 

    res.status(201);
    res.json({
        ...newSpot.dataValues, 
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        createdAt: formattedCreatedAt,
        updatedAt: formattedUpdatedAt
    }); 
}); 




// ADD AN IMAGE TO A SPOT BASED ON THE SPOT'S ID 
router.post('/:spotId/images', requireAuth, async (req, res) => {
    const spotId = req.params.spotId;
    const { user } = req;
    const spot = await Spot.findByPk(spotId); 
    const { url, preview } = req.body;

    if (spot) {
        if (user.id === spot.dataValues.ownerId) {
            const newImage = await SpotImage.create({
                spotId : spotId,
                url,
                preview
            });
            // Grab the id
            const { id } = newImage;
            
            res.status(201); 
            res.json({
                id, 
                url,
                preview
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
            message: `Spot with an id of ${spotId} could not be found`
        }); 
    }
});

// EDIT A SPOT
router.put('/:spotId', [requireAuth, validateCreateSpot], async (req, res) => {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId); 
    const { user } = req;
    
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    if (spot) {
        if (user.id === spot.dataValues.ownerId) {
            if (address !== undefined) spot.address = address;
            if (city !== undefined) spot.city = city;
            if (state !== undefined) spot.state = state;
            if (country !== undefined) spot.country = country;
            if (lat !== undefined) spot.lat = lat;
            if (lng !== undefined) spot.lng = lng;
            if (name !== undefined) spot.name = name;
            if (description !== undefined) spot.description = description;
            if (price !== undefined) spot.price = price;
        
            await spot.save();

            // Format dates
            let createdAt = spot.dataValues.createdAt; 
            let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 
        
        
            let updatedAt = spot.dataValues.updatedAt;
            let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 

            res.json({
                ...spot.dataValues, 
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
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
            message: `Spot with an id of ${spotId} could not be found`
        });
    }
}); 


// DELETE A SPOT
router.delete('/:spotId', requireAuth, async (req, res) => {
    const spotId = req.params.spotId;
    const toDeleteSpot = await Spot.findByPk(spotId); 
    const { user } = req; 

    if (toDeleteSpot) {
        if (user.id === toDeleteSpot.dataValues.ownerId) {
            toDeleteSpot.destroy(); 

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
            message: `Spot with and id of ${spotId} could not be found`
        }); 
    }
}); 




module.exports = router;