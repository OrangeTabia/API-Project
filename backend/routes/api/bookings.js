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

// EDIT A BOOKING
router.put('/:bookingId', [requireAuth, validateBookingDates], async (req, res, next) => {
    const bookingId = req.params.bookingId;
    const { user } = req;
    const { spotId, userId, startDate, endDate } = req.body;
    const booking = await Booking.findByPk(bookingId);

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
//-------------------------HELPER FUNCTION END-------------------------//

    if (booking) {
        if (user.id === booking.dataValues.userId) {
            const date = new Date();
            if (endDate > date.toISOString()) {
                const existingBookings = await Booking.findAll({
                    where: {
                        id: bookingId
                    }
                });

                error = findBadBookings(existingBookings);
                if (error) {
                    res.status(403);
                    next(error);

                } else {
                    // logic to edit the booking
                    booking.startDate = startDate;
                    booking.endDate = endDate;

                    await booking.save();

                    res.json(booking); 

                }

            } else {
                res.status(403);
                res.json({
                    message: 'Past bookings can not be modified'
                }); 
            }

        } else {
            res.status(401);
            res.json({
                message: 'Unauthorized'
            }); 
        }

    } else {
        res.status(404);
        res.json({
            message: 'Booking could not be found'
        });
    }

});







module.exports = router;