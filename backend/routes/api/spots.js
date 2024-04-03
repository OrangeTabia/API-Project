const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


// Get all spots
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
            // Ensure we round to the nearest 
            avgRating: Math.floor(spotRating.dataValues.avgRating * 2) / 2,
            previewImage: spot.SpotImages[0]?.url,
        }
    }))

    res.json({
        Spots: formattedSpots
    }); 
}); 


// Get all spots owned by the current user
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
            previewImage: spot.SpotImages[0]?.url
        }
    }));


    res.json({
        Spots: formattedSpots
    }); 
}); 

// Get details of spot by spotId
router.get('/:spotId', async (req, res) => {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId, { 
        include: [
            {model: SpotImage, attributes: ['id', 'url', 'preview']},
            {model: User, attributes: ['id', 'firstName', 'lastName']},
        ]
    }); 

    if (spot) {
        // Get the avgRating and numReviews

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
            message: "Spot couldn't be found"
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


// Create a spot
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


// Add an image to a spot based on spot's id
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
        const payload = { 
            id, url, preview
        }
        res.json(payload);
    } else {
        res.status(404); 
        res.json({
            message: "Spot couldn't be found"
        }); 
    }
});

// Edit a spot



module.exports = router;