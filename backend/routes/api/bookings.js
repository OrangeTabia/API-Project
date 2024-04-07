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
        }
    });
    

    // Format dates
    let createdAt = bookings[0].dataValues.createdAt; 
    let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 


    let updatedAt = bookings[0].dataValues.updatedAt;
    let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 


    let formattedBookings = await Promise.all(bookings.map(async (book) => {
        // Find the preview image
        const previewImage = await SpotImage.findOne({
            where: {
                spotId: book.spotId,
                preview: true
            }
        }); 
        // Then find the spot itself 
        let currentSpot = await Spot.findOne({
            where: {
                id: book.spotId
            }, 
            attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
        });

            // Format lat and lng
            let lat = currentSpot.dataValues.lat;
            let lng = currentSpot.dataValues.lng;

        return {
            ...book.dataValues,
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            // Hanlde the case where theres a null value
            Spot: {
                ...currentSpot?.dataValues,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                previewImage: previewImage?.url
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

// EDIT A BOOKING
router.put('/:bookingId', [requireAuth, validateBookingDates], async (req, res, next) => {
    const bookingId = req.params.bookingId;
    const { user } = req;
    const { startDate, endDate } = req.body;
    const booking = await Booking.findByPk(bookingId);

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
//-------------------------HELPER FUNCTION END-------------------------//

    if (booking) {
        if (user.id === booking.dataValues.userId) {
            const date = new Date();
            if (endDate > date.toISOString()) {
                const existingSpotBookings = await Booking.findAll({
                    where: {
                        spotId: booking.spotId,
                        id: {
                            [Sequelize.Op.not]: bookingId
                        }
                    }
                });

                error = findBadBookings(existingSpotBookings);
                if (error) {
                    res.status(403);
                    next(error);

                } else {
                    // logic to edit the booking
                    booking.startDate = startDate;
                    booking.endDate = endDate;

                    await booking.save();

                    let createdAt = booking.dataValues.createdAt; 
                    let formattedCreatedAt = createdAt.toISOString().split(".")[0].replace('T', ' '); 
    
    
                    let updatedAt = booking.dataValues.updatedAt;
                    let formattedUpdatedAt = updatedAt.toISOString().split(".")[0].replace('T', ' '); 

                    res.json({
                        ...booking.dataValues,
                        createdAt: formattedCreatedAt,
                        updatedAt: formattedUpdatedAt
                    }); 

                }

            } else {
                res.status(403);
                res.json({
                    message: 'Past bookings cannot be modified'
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
            message: `Booking with an id of ${bookingId} could not be found`
        });
    }

});


// DELETE A BOOKING
router.delete('/:bookingId', requireAuth, async (req, res) => {
    const bookingId = req.params.bookingId;
    const { user } = req;
    const booking = await Booking.findByPk(bookingId); 

    if (booking) {
        if (user.id === booking.dataValues.userId || user.id === Spot.ownerId) {
            const date = new Date();
            if (booking > date.toISOString()) {

                booking.destroy();
                res.json({
                    message: 'Successfully deleted'
                });

            } else {
                res.status(403);
                res.json({
                    message: 'Bookings that have been started cannot be deleted'
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
            message: `Booking with id of ${bookingId} could not be found`
        }); 
    }
});




module.exports = router;