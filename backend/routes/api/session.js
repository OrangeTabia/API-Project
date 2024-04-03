// backend/routes/api/session.js
const express = require('express'); 
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const { validateLogin } = require('../../utils/validation');
const router = express.Router();


// Log In a User
router.post(
    '/',
    validateLogin,
    async (req, res, next) => {
      const { credential, password } = req.body;

      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });

  
      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' };
        return next(err);
      }
  
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };
 
  
      await setTokenCookie(res, safeUser);
  
      return res.json({
        user: safeUser
      });
    }, 
    // // Error handler for invalid credentials
    // (err, req, res, next) => 
    // {
    //   // When there's a 401, we know that this is due to the credentials failing
    //   if (err.status === 401) { 
    //     res.status(401)
    //     res.json({message: "Invalid credentials"})
    //   }
    //   next(err)
    // }, 
  );


// Log Out a User
router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
  );
  
 
// Restore session user
router.get(
  '/',
  (req, res) => {
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };
      return res.json({
        user: safeUser
      });
    } else return res.json({ user: null });
  }
);





module.exports = router;