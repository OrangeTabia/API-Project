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
        url: 'https://www.rgj.com/gcdn/presto/2021/12/01/PREN/d05da14e-7274-4e2d-9aae-07d83667243e-859_Lakeshore_01.jpg', 
        preview: true
      }, 
      {
        spotId: 2, 
        url: 'https://www.mountainliving.com/content/uploads/data-import/ae886c8e/DJI_0087bach-house.jpg', 
        preview: true
      }, 
      {
        spotId: 3, 
        url: 'https://images.contentstack.io/v3/assets/blt00454ccee8f8fe6b/blt6e8cb5a8cbee5e30/60913316f07013101daf2910/US_LakeTahoe_US_Header.jpg', 
        preview: true
      }, 
    ], { validate: true }); 
  },

  async down (queryInterface, Sequelize) {

    options.tableName = 'SpotImages'; 
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      preview: { [Op.in]: [true, false] }
    }, {});
  }
};
