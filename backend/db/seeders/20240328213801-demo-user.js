'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.bear_bnb_schema
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate(options, [
      {
        firstName: 'Jonny', 
        lastName: 'Ye',
        email: 'demo1@gmail.com',
        username: 'DemoUser1',
        hashedPassword: bcrypt.hashSync('password1')
      }, 
      {
        firstName: 'Tabia',
        lastName: 'Glazier',
        email: 'demo2@gmail.com',
        username: 'DemoUser2',
        hashedPassword: bcrypt.hashSync('password2')
      }, 
      {
        firstName: 'Chubbs',
        lastName: 'Chubberson',
        email: 'demo3@gmail.com',
        username: 'DemoUser3',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true }); 
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users'; 
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['DemoUser1', 'DemoUser2', 'DemoUser3'] }
    }, {}); 
  }
};
