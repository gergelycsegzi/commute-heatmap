const TILE_RESOLUTION = 100;

// Note that if you change the destinations or the polygon you should delete the cached commute times
// otherwise you will have overlapping tiles
const destRawCoords = [
    // taken from Google Maps
    [51.49686188896353, -0.17635646327104795], // Natural History museum
    [51.50563813269474, -0.09047423464310923] // Borough Market
  ]
const DESTINATIONS = destRawCoords.map((rawCoord) => ({ lat: rawCoord[0], lng: rawCoord[1] }));

const polygonRawCoords = [
    // generated with https://geojson.io/
    // NOTE: the order of the coordinates is generated differently than Google Maps
    [
    -0.16317578466919258,
    51.5229519226049
    ],
    [
    -0.16317578466919258,
    51.478555677678855
    ],
    [
    -0.07575795835097665,
    51.478555677678855
    ],
    [
    -0.07575795835097665,
    51.5229519226049
    ],
    [
    -0.16317578466919258,
    51.5229519226049
    ]
];
const POLYGON_COORDS = polygonRawCoords.map((rawCoord) => ({ lat: rawCoord[1], lng: rawCoord[0] }));

var context = (typeof exports != "undefined") ? exports : window;
context.TILE_RESOLUTION = TILE_RESOLUTION;
context.DESTINATIONS = DESTINATIONS;
context.POLYGON_COORDS = POLYGON_COORDS;
// module.exports = {  
//     TILE_RESOLUTION,  
//     DESTINATIONS,
//     POLYGON_COORDS,  
// };

// export {  
//   TILE_RESOLUTION,  
//   DESTINATIONS,  
//   POLYGON_COORDS,  
// };  