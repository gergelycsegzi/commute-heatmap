let map;  
let heatmap;  
let destinations = [  
  // Add your destination coordinates here  
  // Example: {lat: 37.774546, lng: -122.433523},  
];  
  
function initMap() {  
  map = new google.maps.Map(document.getElementById("map"), {  
    zoom: 13,  
    center: { lat: 37.774546, lng: -122.433523 }, // Set the center to your desired location  
    mapTypeId: "roadmap",  
  });  
  
  heatmap = new google.maps.visualization.HeatmapLayer({  
    data: [],  
    map: map,  
  });  
  
  calculateCommuteTimes();  
}  
  
function calculateCommuteTimes() {  
  const directionsService = new google.maps.DirectionsService();  
  const travelMode = google.maps.TravelMode.DRIVING;  
  
  destinations.forEach((destination) => {  
    const request = {  
      origin: map.getCenter(),  
      destination: destination,  
      travelMode: travelMode,  
    };  
  
    directionsService.route(request, (result, status) => {  
      if (status === google.maps.DirectionsStatus.OK) {  
        const commuteTime = result.routes[0].legs[0].duration.value;  
        addHeatmapPoint(destination, commuteTime);  
      }  
    });  
  });  
}  
  
function addHeatmapPoint(destination, weight) {  
  heatmap.getData().push({  
    location: new google.maps.LatLng(destination.lat, destination.lng),  
    weight: weight,  
  });  
}  
