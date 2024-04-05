const express = require('express');
const { Sequelize } = require('sequelize'); 
const { Spot, User, Review, SpotImage, Booking, ReviewImage } = require('../../db/models'); 
const { Op } = require('sequelize'); 
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// DELETE A SPOT IMAGE
router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const { user } = req;
    const image = await SpotImage.findByPk(imageId); 

    if (image) {
        if (user.id === image.dataValues.spotId) {

            image.destroy();

            res.json({
                message: 'Successfully deleted'
            }); 
            
        } else {
            res.status(400);
            res.json({
                message: 'Unauthorized'
            }); 
        }

    } else {
        res.status(404);
        res.json({
            message: `Spot Image with an id of ${imageId} could not be found`
        }); 
    }
}); 


module.exports = router;