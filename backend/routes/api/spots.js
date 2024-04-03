const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
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


module.exports = router;