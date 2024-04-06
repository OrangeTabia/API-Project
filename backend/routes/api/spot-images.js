const express = require('express');
const { SpotImage, Spot } = require('../../db/models'); 
const { requireAuth } = require('../../utils/auth');
const router = express.Router();


// DELETE A SPOT IMAGE
router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const { user } = req;
    const image = await SpotImage.findByPk(imageId); 

    if (image) {
        // Let's query a spot that has the spotId (from image) and the owner! 
        const spot = await Spot.findOne({
            where: {
                id: image.spotId,
                ownerId: user.id,
            }
        })
        // If this is correct, you're the owner and can destroy
        if (spot) {

            image.destroy();

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
            message: `Spot Image with an id of ${imageId} could not be found`
        }); 
    }
}); 


module.exports = router;