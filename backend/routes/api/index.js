// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const bookingsRouter = require('./bookings.js');
const reviewsRouter = require('./reviews.js');
const spotImagesRouter = require('./spot-images.js');
const reviewImagesRouter = require('./review-images.js');
const { restoreUser } = require('../../utils/auth.js');

router.use(restoreUser);

router.use('/session', sessionRouter); // login and logout

router.use('/users', usersRouter); // creating a new user / signup

router.use('/spots', spotsRouter);

router.use('/bookings', bookingsRouter); 

router.use('/reviews', reviewsRouter); 

router.use('/spot-images', spotImagesRouter); 

router.use('/review-images', reviewImagesRouter);


router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

// router.post('/test', function(req, res) {
//     res.json({ requestBody: req.body });
//   });


// // GET /api/require-auth
// const { requireAuth } = require('../../utils/auth.js');
// router.get(
//   '/require-auth',
//   requireAuth,
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

// // GET /api/restore-user
// router.get(
//   '/restore-user',
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

  
// // GET /api/set-token-cookie
// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'DemoUser1'
//     }
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });



module.exports = router;