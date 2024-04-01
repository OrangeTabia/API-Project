'use strict';

const { Booking } = require('../models'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.bear_bnb_schema
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Booking.bulkCreate([
      {
        userId: 1,
        startDate: '2023-07-01', 
        endDate: '2023-07-15'
      }, 
      {
        userId: 2,
        startDate: '2022-08-20', 
        endDate: '2022-08-30'
      },
      {
        userId: 3,
        startDate: '2023-12-20', 
        endDate: '2024-01-15'
      },

    ], { validate: true }); 
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [1, 2, 3] }
    }, {}); 
  }
};
