const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage, Booking } = require('../../db/models'); 
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
        res.json({
            message: 'Spot could not be found'
        }); 
    }
});


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


// Middleware for spot belonging to current user
const authorizeSpotOwner = async (req, res, next) => {
    const user = req.user;

    if (user) {
        const spotId = req.params.spotId;

        // See if there's a spot associated with the spotId param
        const currentSpot = await Spot.findOne({
            where: { 
                // AND belongs to the user
                id: spotId,
                ownerId: user.id,
            }
        });
        // Set it as a request attribute
        req.spot = currentSpot; 
        next();

    } else {
        const err = new Error('Authorization required');
        err.title = 'Authorization required';
        err.erros = { message: 'Forbidden'}; 
        err.status = 403;
        return next(err); 
    }
}


// ADD AN IMAGE TO A SPOT BASED ON THE SPOT'S ID 
router.post('/:spotId/images', [requireAuth, authorizeSpotOwner], async (req, res) => {

    // Pull the spot from the request middle ware
    const { spot } = req;

    // Pull out the request body
    const { url, preview } = req.body;

    if (spot) {
        const newImage = await SpotImage.create({
            spotId : spot.id,
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
        res.status(404); 
        res.json({
            message: 'Spot could not be found'
        }); 
    }
});

// EDIT A SPOT
router.put('/:spotId', [requireAuth, authorizeSpotOwner, validateCreateSpot], async (req, res) => {
    const spotId = req.params.spotId;
    const currentSpot = await Spot.findByPk(spotId); 
    
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    if (currentSpot) {
        if (address !== undefined) currentSpot.address = address;
        if (city !== undefined) currentSpot.city = city;
        if (state !== undefined) currentSpot.state = state;
        if (country !== undefined) currentSpot.country = country;
        if (lat !== undefined) currentSpot.lat = lat;
        if (lng !== undefined) currentSpot.lng = lng;
        if (name !== undefined) currentSpot.name = name;
        if (description !== undefined) currentSpot.description = description;
        if (price !== undefined) currentSpot.price = price;

        const { ownerId } = currentSpot;

        await currentSpot.save();

        res.json({
            id: parseInt(spotId),
            ownerId, 
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
    } else {
        res.status(404)
        res.json({
            message: 'Spot could not be found'
        });
    }
}); 


// DELETE A SPOT
router.delete('/:spotId', [requireAuth, authorizeSpotOwner], async (req, res) => {
    const spotId = req.params.spotId;
    const toDeleteSpot = await Spot.findByPk(spotId); 

    if (toDeleteSpot) {
        toDeleteSpot.destroy(); 

        res.json({
            message: 'Successfully deleted'
        });
    } else {
        res.status(404); 
        res.json({
            message: 'Spot could not be found'
        }); 
    }

}); 





module.exports = router;