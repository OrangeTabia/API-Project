const express = require('express');
const { ReviewImage, Review } = require('../../db/models'); 
const { requireAuth } = require('../../utils/auth');
const router = express.Router();


// DELETE A REVIEW IMAGE
router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const image = await ReviewImage.findByPk(imageId); 
    const { user } = req;

    if (image) {
        // Find the review that is tied to the images review ID + the logged in USER!
        const review = await Review.findOne({
            where: { 
                id: image.reviewId,
                userId: user.id
            }
        })
        if (review) {
            // Delet the Image
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