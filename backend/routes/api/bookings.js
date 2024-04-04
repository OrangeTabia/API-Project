const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage, Booking } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


// GET ALL OF THE CURRENT USER'S BOOKINGS
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

    const bookings = await Booking.findAll({
        where: {
            userId: user.id
        },
        include: [
            {model: Spot, 
                attributes: {
                exclude: ['description', 'updatedAt', 'createdAt']
                }, 
            }, 
        ]
    });

    let formattedBookings = await Promise.all(bookings.map(async (book) => { 
        // Just query for the first SpotImage once we map through bookings
        const firstImage = await SpotImage.findOne({
            where: {
                spotId: book.Spot.id,
                preview: true
            }
        }); 
        return {
            ...book.dataValues,
            Spot: {
                ...book.Spot.dataValues,
                previewImage: firstImage?.url
            }
        }
    })); 

    res.json({
        Bookings: formattedBookings
    }); 
}); 







module.exports = router;