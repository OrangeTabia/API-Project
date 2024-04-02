'use strict';

const { ReviewImage } = require('../models'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await ReviewImage.bulkCreate([
      {
        reviewId: 1, 
        url: 'Reivew Image 1'
      }, 
      {
        reviewId: 2, 
        url: 'Reivew Image 2'
      }, 
      {
        reviewId: 3, 
        url: 'Reivew Image 3'
      }, 
    ], { validate: true } ); 
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [1, 2, 3] }
    }, {}); 
  }
};
