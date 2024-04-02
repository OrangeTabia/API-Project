'use strict';

const { Spot } = require('../models'); 

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await Spot.bulkCreate([
      {
        ownerId: 1, 
        address: '10 Snowshoe Rd',
        city: 'Arnold',
        state: 'California', 
        country: 'United States of America',
        lat: 38.4693867,
        lng: 120.0489712,
        name: 'Bear Valley Ski Chalet',
        description: 'Stay in the Sierra Nevada anytime of the year! The winter is a snowbound community, so the only place to get around is snowmobile! The summertime draws large crowds too due to the sunny weather, and cooling lake!',
        price: 500
      },
      {
        ownerId: 2, 
        address: '40203 Dream St',
        city: 'Big Bear Lake',
        state: 'California', 
        country: 'United States of America',
        lat: 34.2420245,
        lng: 116.9248954,
        name: 'Midnight Chalet at Big Bear Lake',
        description: 'Experince a majestic lakefront property at Big Bear Lake. There are plenty of family friendly activities within walking distance, and snow activities in the winter!',
        price: 300
      },
      {
        ownerId: 3, 
        address: '1 Dice Bay',
        city: 'Port Alsworth',
        state: 'Alaska', 
        country: 'United States of America',
        lat: 60.1974612,
        lng: 154.3222634,
        name: 'Stonewood Luxury Lodge Bear Viewing',
        description: 'Welcome to an all inclusive luxury wilderness lodge!',
        price: 700
      },

    ], { validate: true } );  
  },

  async down (queryInterface, Sequelize) {

    options.tableName = 'Spots'; 
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      ownerId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};