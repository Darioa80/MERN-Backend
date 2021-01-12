const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY  = 'AIzaSyAujB4X2QK-qGN3ts7VVgfjFvuZkF1grfI';

async function getCoordsForAddress(address) {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=${API_KEY}
    `);
    const data=response.data;
        console.log(data);
    if(!data || data.stats == 'ZERO_RESULTS'){
        const error = new HttpError('Could not find location for the specified address', 422);
        throw error;
    }
    
    const coordinates = data.results[0].geometry.location;
    console.log('Google API coordinates');
    console.log(coordinates);
    return coordinates;
}

module.exports = getCoordsForAddress;