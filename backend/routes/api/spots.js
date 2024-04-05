const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage, Booking, ReviewImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


// GET ALL SPOTS
router.get('/', async (req, res) => {

    const allSpots = await Spot.findAll({
        include: [
            {model: SpotImage, attributes: ['url']}
        ]
    }); 

    let formattedSpots =  await Promise.all(allSpots.map(async (spot) => { 
        // This is for the aggregated query over the average stars 
        const spotRating = await Spot.findOne({
            where: {
                id: spot.id,
            },
            attributes: {
                include: [
                    [
                        Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), 
                        "avgRating"
                    ],
                    
                ],
            },
            include: [
                {model: Review, attributes: ['stars']}
            ]
        });

        // Unpack attributes
        const {id, ownerId, address, city, country, lat, lng, name, description, price, createdAt, updatedAt} = spot;

        // TODO: Serialize attributes in a more concise way
        return {
            id,
            ownerId,
            address,
            city,
            country,
            lat,
            lng,
            name,
            description,
            price,
            createdAt,
            updatedAt,
            // Ensure we round to the nearest .5 with Math.floor
            avgRating: Math.floor(spotRating.dataValues.avgRating * 2) / 2,
            // Looks through the spotImages until it finds the one that is a preview
            previewImage: spot.SpotImages.find((img) => img.preview )?.url
        }
    }))

    res.json({
        Spots: formattedSpots
    }); 
}); 


// GET ALL SPOTS OWNED BY THE CURRENT USER
router.get('/current', requireAuth, async (req, res) => {
    const {user} = req;

    const currentUserSpots = await Spot.findAll({
        where: {
            ownerId: user.id
        }, 
        include: [
            {model: SpotImage, attributes: ['url']},
        ],
    }); 

    let formattedSpots =  await Promise.all(currentUserSpots.map(async (spot) => {

        const {id, ownerId, address, city, state, country, lat, lng, name, description, price, createdAt, updatedAt } = spot; 

        const spotRating = await Spot.findOne({
            where: {
                id: spot.id,
            },
            attributes: {
                include: [
                    [
                        Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), 
                        "avgRating"
                    ],
                    
                ],
            },
            include: [
                {model: Review, attributes: ['stars']}
            ]
        });

        return {
            id, 
            ownerId, 
            address,
            city,
            state, 
            country,
            lat,
            lng,
            name,
            description,
            price,
            createdAt,
            updatedAt,
            avgRating: Math.floor(spotRating.dataValues.avgRating * 2) / 2,
            // Looks through the spotImages until it finds the one that is a preview
            previewImage: spot.SpotImages.find((img) => img.preview )?.url
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
            }, 
            include: [
                {model: User, attributes: ['id', 'firstName', 'lastName']},
                {model: ReviewImage, attributes: ['id', 'url']}
            ]
        }); 

        res.json({
            Reviews: reviews
        });
        
    } else {
        res.status(401);
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
                include: [
                    {model: User, attributes: {
                        exclude: ['email', 'hashedPassword', 'createdAt', 'updatedAt', 'username']
                    }}
                ]
            }); 
            res.json({
                Bookings: ownerBookings
            }); 
        } 

        // Guest Logic
        else {
            const guestBookings = await Booking.findAll({
                where: {
                    spotId: spotId,
                }, 
                attributes: {
                    exclude: ['id', 'userId', 'createdAt', 'updatedAt']
                }
            }); 
            res.json({
                Bookings: guestBookings
            }); 
        }
    }
    // Spot does not exist
    else {
        res.status(404); 
        res.json({
            message: 'Spot could not be found'
        }); 
    }

});

// Middleware for body validation errors
const validateBookingDates = async (req, res, next) => {
    const { startDate, endDate } = req.body;

    // Checks if startDate exists 
    if (startDate === "" || startDate === null) {
        const err = new Error('startDate is required and must be in valid "YYYY-MM-DD" format'); 
        err.status = 400;
        next(err); 
    }

    // Checks if endDate exists
    if (endDate === "" || endDate === null) {
        const err = new Error('endDate is required and must be in valid "YYYY-MM-DD" format'); 
        err.status = 400;
        next(err); 
    }

    // Checks if startDate is in the past
    const date = new Date()
    if (startDate < date.toISOString()) {
        const err = new Error('Bad Request'); 
        err.errors = 'startDate cannot be in the past'; 
        err.status = 400; 
        next(err); 
    } 
    // Checks if endDate is before the startDate
    if (endDate <= startDate) {
        const err = new Error("Bad Request")
        err.errors = "endDate cannot be on or before startDate"
        err.status = 400; 
        next(err); 
    } else next();
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
        let existingEnd = booking.dataValues.startDate;

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

        if (startDate >= existingStart && startDate < existingEnd) {

            err = new Error('Sorry, this spot is already booked for the specified dates');
            err.status = 403; 
            err.errors = {
                startDate: 'Start date conflicts with an existing booking'
            }
            return err; 
        }

        if (endDate > existingStart && endDate <= existingEnd) {

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
                res.json(newBooking); 
            }
        } else {
            res.status(400);
            res.json({
                message: 'Owner cannot create bookings'
            });
        }
    } else {
        res.status(404);
        res.json({
            message: 'Spot could not be found'
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
    })

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
            res.status(201); 
            res.json(newReview); 
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
    const spot = await Spot.findByPk(spotId, { 
        include: [
            {model: SpotImage, attributes: ['id', 'url', 'preview']},
            {model: User, attributes: ['id', 'firstName', 'lastName']},
        ]
    }); 

    if (spot) {
        const {id, ownerId, address, city, state, country, lat, lng, name, description, price, createdAt, updatedAt } = spot;

        const spotRating = await Spot.findOne({
            where: {
                id: spot.id,
            },
            attributes: {
                include: [
                    [
                        Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), 
                        "avgRating"
                    ],
                    [
                        Sequelize.fn("COUNT", Sequelize.col("Reviews.stars")), 
                        "numReviews"
                    ]
                ],
            },
            include: [
                {model: Review, attributes: ['stars']}, 
            ]
        });

        const payload = {
            id, 
            ownerId,
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price,
            createdAt,
            updatedAt,
            numReviews: spotRating.dataValues.numReviews,
            avgStarRating: Math.floor(spotRating.dataValues.avgRating * 2) / 2,
            SpotImages: spot.SpotImages,
            Owner: spot.User
        }
        res.json(payload); 
    } else {
        res.status(404); 
        res.json({
            message: 'Spot could not be found'
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
    const {address, city, state, country, lat, lng, name, description, price} = req.body; 

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
        price
    }); 

    res.status(201);
    res.json(newSpot); 
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
            message: 'Spot could not be found'
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

            res.json(spot);

        } else {
            res.status(403);
            res.json({
                message: 'Forbidden'
            });
        }
    } else {
        res.status(404);
        res.json({
            message: 'Spot could not be found'
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
            message: 'Spot could not be found'
        }); 
    }
}); 




module.exports = router;