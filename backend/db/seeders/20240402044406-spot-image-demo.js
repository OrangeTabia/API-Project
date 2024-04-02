'use strict';

const { SpotImage } = require('../models'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await SpotImage.bulkCreate([
      {
        spotId: 1, 
        url: 'Image 1', 
        preview: true
      }, 
      {
        spotId: 2, 
        url: 'Image 2', 
        preview: true
      }, 
      {
        spotId: 3, 
        url: 'Image 3', 
        preview: true
      }, 
    ], { validate: true }); 
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
