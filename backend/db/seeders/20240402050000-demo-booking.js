'use strict';

const { Booking } = require('../models'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 2,
        startDate: '2024-07-01', 
        endDate: '2024-07-15'
      }, 
      {
        spotId: 2,
        userId: 3,
        startDate: '2024-08-20', 
        endDate: '2024-08-30'
      },
      {
        spotId: 3,
        userId: 1,
        startDate: '2025-12-10', 
        endDate: '2025-12-30'
      },

    ], { validate: true }); 
  },

  async down (queryInterface, Sequelize) {

    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [1, 2, 3] }
    }, {}); 
  }
};
