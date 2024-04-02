'use strict';

const { Review } = require('../models'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await Review.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        review: 'Cozy cabin that is great for winter skiing!',
        stars: 5
      }, 
      {
        spotId: 2,
        userId: 2,
        review: 'Lovely lakeside home',
        stars: 4
      }, 
      {
        spotId: 1,
        userId: 1,
        review: 'The big bears were fun to see!',
        stars: 5
      }
    ], { validate: true } ); 
  },

  async down (queryInterface, Sequelize) {

    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3] }
    }, {}); 
  }
};
