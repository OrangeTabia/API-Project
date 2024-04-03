const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 

const router = express.Router();

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

module.exports = router;