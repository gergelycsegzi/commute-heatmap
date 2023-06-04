let map;  
let heatmap;  
let destinations = [  
  {lat: 35.693036563415404, lng: 139.69724301799377},
  {lat: 35.66860997776402, lng: 139.70446852377793},
];  

let polygonCoords = [
    // generated with https://geojson.io/
    {lat: 35.60619161973395, lng: 139.75469598879},
    {lat: 35.718431445098474, lng: 139.77943189073812},
    {lat: 35.74538449871655, lng: 139.76197644448854},
    {lat: 35.7547774190017, lng: 139.7101793050744},
    {lat: 35.73583646025007, lng: 139.67640681124306},
    {lat: 35.685914195220334, lng: 139.66558883552784},
    {lat: 35.601244499881545, lng: 139.6861065510488},
    {lat: 35.60619161973395, lng: 139.75469598879},
]; 
  
const tileResolution = 500; // Tile resolution in square meters  
  
function initMap() {  
  map = new google.maps.Map(document.getElementById("map"), {  
    zoom: 13,  
    center:   {lat: 35.693036563415404, lng: 139.69724301799377}, // Set the center to your desired location  
    mapTypeId: "roadmap",  
  });  
  
  const polygon = new google.maps.Polygon({  
    paths: polygonCoords,  
    map: map,  
  });  
  
  const gridPoints = generateGridPoints(polygon, tileResolution); 
  console.log(gridPoints.length);
//   calculateCommuteTimes(gridPoints);  
}  
  
function generateGridPoints(polygon, resolution) {  
  const bounds = new google.maps.LatLngBounds();  
  polygon.getPath().forEach((coord) => {  
    bounds.extend(coord);  
  });  
  
  const northWest = bounds.getSouthWest();  
  const southEast = bounds.getNorthEast();  
  const latStep = (resolution * 0.000009) / Math.cos((northWest.lat() * Math.PI) / 180);  
  const lngStep = 0.000012 * resolution;  
  const gridPoints = [];  
  
  for (let lat = northWest.lat(); lat <= southEast.lat(); lat += latStep) {  
    for (let lng = northWest.lng(); lng <= southEast.lng(); lng += lngStep) {  
      const point = new google.maps.LatLng(lat, lng);  
      if (google.maps.geometry.poly.containsLocation(point, polygon)) {  
        gridPoints.push(point);  
      }  
    }  
  }  
  
  return gridPoints;  
}  
  
function calculateCommuteTimes(gridPoints) {  
  const directionsService = new google.maps.DirectionsService();  
  const travelMode = google.maps.TravelMode.TRANSIT;
  
  gridPoints.forEach((point) => {  
    const request = {  
      origin: point,  
      destination: map.getCenter(),  
      travelMode: travelMode,  
    };  
  
    directionsService.route(request, (result, status) => {  
      if (status === google.maps.DirectionsStatus.OK) {  
        const commuteTime = result.routes[0].legs[0].duration.value;  
        addColoredTile(point, commuteTime);  
      }  
    });  
  });  
}  
  
function addColoredTile(point, weight) {  
  const color = getColorByCommuteTime(weight);
  // The rectangle is automatically displayed on the map because the map property is set to the map instance.
  const rectangle = new google.maps.Rectangle({  
    strokeColor: color,  
    strokeOpacity: 0.8,  
    strokeWeight: 1,  
    fillColor: color,  
    fillOpacity: 0.35,  
    map: map,  
    bounds: {  
      north: point.lat(),  
      south: point.lat() - (tileResolution * 0.000009) / Math.cos((point.lat() * Math.PI) / 180),  
      east: point.lng() + 0.000012 * tileResolution,  
      west: point.lng(),  
    },  
  });  
}  
  
function getColorByCommuteTime(time) {  
  // Customize this function to return a color based on the commute time  
  if (time <= 600) {  
    return "#00FF00"; // Green for <= 10 minutes  
  } else if (time <= 1200) {  
    return "#FFFF00"; // Yellow for <= 20 minutes  
  } else if (time <= 1800) {  
    return "#FFA500"; // Orange for <= 30 minutes  
  } else {  
    return "#FF0000"; // Red for > 30 minutes  
  }  
}  
