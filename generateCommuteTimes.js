require('dotenv').config();
const {TILE_RESOLUTION, DESTINATIONS, POLYGON_COORDS} = require('./public/constants.js'); 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  

const e = require('express');
const fs = require('fs');
const geolib = require('geolib');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;  
const googleMapsClient = require('@google/maps').createClient({  
  key: apiKey,  
  Promise: Promise  
});

function generateGridPoints(polygonCoords, resolution) {  
  const bounds = polygonCoords.reduce(  
    (acc, coord) => {  
      return {  
        north: Math.max(acc.north, coord.lat),  
        south: Math.min(acc.south, coord.lat),  
        east: Math.max(acc.east, coord.lng),  
        west: Math.min(acc.west, coord.lng),  
      };  
    },  
    { north: -90, south: 90, east: -180, west: 180 }  
  );  
  
  const northWest = { lat: bounds.south, lng: bounds.west };  
  const southEast = { lat: bounds.north, lng: bounds.east };  
  const latStep = (resolution * 0.000009) / Math.cos((northWest.lat * Math.PI) / 180);  
  const lngStep = 0.000012 * resolution;  
  const gridPoints = [];  
  
  for (let lat = northWest.lat; lat <= southEast.lat; lat += latStep) {  
    for (let lng = northWest.lng; lng <= southEast.lng; lng += lngStep) {  
      const point = { lat: lat, lng: lng }
      if (  
        geolib.isPointInPolygon(  
          { latitude: point.lat, longitude: point.lng },  
          polygonCoords.map((coord) => ({ latitude: coord.lat, longitude: coord.lng }))  
        )  
      ) {  
        gridPoints.push(point);  
      }  
    }  
  }  
  
  console.log(`Grid points to compare: `, gridPoints.length);  
  return gridPoints;
}  

const gridPoints = generateGridPoints(POLYGON_COORDS, TILE_RESOLUTION);  

const ELEMENTS_LIMIT = 1000; // Maximum number of elements per second  
const REQUEST_DELAY = 1000; // Delay between requests in milliseconds  
  
async function calculateCommuteTimes(gridPoints, destinations) {  
  const travelMode = 'transit';  
  let elementsCount = 0;  
  
  for (const point of gridPoints) {  
    const key = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;  
    const savedApiResponse = loadApiResponseFromFile(key);  
  
    if (savedApiResponse) {  
      const commuteTimes = extractCommuteTimes(savedApiResponse);
      console.log(`Cache hit for point: `, key);  
      processCommuteTimes(point, commuteTimes);  
    } else {  
      const request = {  
        origins: [point],  
        destinations: destinations,  
        mode: travelMode,  
      };  
  
      try {
        elementsCount += destinations.length;
        if (elementsCount >= ELEMENTS_LIMIT) {  
          await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));  
          elementsCount = 0;  
        }

        // unfortunately does not work for Japan: https://developers.google.com/maps/faq#transit_directions_countries
        // alternative would be this, but there is no easy access: https://api-sdk.navitime.co.jp/api/specs/api_guide/route_transit.html
        const response = await googleMapsClient.distanceMatrix(request).asPromise();  
        const apiResponse = response.json;  
        saveApiResponseToFile(key, destinations, apiResponse);  
        const commuteTimes = extractCommuteTimes(apiResponse);  
        processCommuteTimes(point, commuteTimes);  

      } catch (err) {  
        console.error(err);  
      }  
    }  
  }  
}
  
function extractCommuteTimes(apiResponse) { 
  return apiResponse.rows[0].elements.map(element => {
    if (element.duration) {
      return element.duration.value;
    } else {
      return -1;
    }
  });  
}  
  
function processCommuteTimes(point, commuteTimes) {  
  // Process the commute times for each destination  
  console.log(`Commute times for point ${point.lat.toFixed(6)},${point.lng.toFixed(6)}:`, commuteTimes);  
}  
  
function saveApiResponseToFile(key, destinations, apiResponse) {  
  const fileName = 'public/commuteTimes.json';  
  
  fs.readFile(fileName, (err, data) => {  
    let json;  
    if (err) {  
      json = {};  
    } else {  
      json = JSON.parse(data);  
    }  
  
    json[key] = {  
      ...apiResponse,
      destinationAddressesLatLong: destinations,
    };  
  
    fs.writeFile(fileName, JSON.stringify(json), (err) => {  
      if (err) console.error(err);  
    });  
  });  
}  
  
function loadApiResponseFromFile(key) {  
  const fileName = 'public/commuteTimes.json';  
  
  if (fs.existsSync(fileName)) {  
    const data = fs.readFileSync(fileName);  
    const json = JSON.parse(data);  
    return json[key];  
  }  
  
  return null;  
} 

(async () => {  
  try {  
    await calculateCommuteTimes(gridPoints, DESTINATIONS);  
    console.log('Commute times calculation completed.');  
  } catch (error) {  
    console.error('An error occurred while calculating commute times:', error);  
  }  
})();