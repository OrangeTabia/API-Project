const express = require('express');
const { ReviewImage } = require('../../db/models'); 
const { requireAuth } = require('../../utils/auth');
const router = express.Router();


// DELETE A REVIEW IMAGE
router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const image = await ReviewImage.findByPk(imageId); 
    const { user } = req;

    if (image) {
        if (user.id === image.dataValues.reviewId) {

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
            message: `Review Image with an id of ${imageId} could not be found`
        }); 
    }
});


module.exports = router;