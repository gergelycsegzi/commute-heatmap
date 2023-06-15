function init() {
  // import { TILE_RESOLUTION, DESTINATIONS, POLYGON_COORDS } from './constants.js';
  const TILE_RESOLUTION = window.TILE_RESOLUTION;
  const DESTINATIONS = window.DESTINATIONS;
  const POLYGON_COORDS = window.POLYGON_COORDS;  

  const MAX_COMMUTE_TIME_CUTOFF = 25 * 60;
        
  const TIME_TO_COLOR_MAP = [  
    { maxTime: 60, color: '#00FF00', label: '<= 1 minute' },  
    { maxTime: 120, color: '#33FF33', label: '<= 2 minutes' },  
    { maxTime: 180, color: '#66FF66', label: '<= 3 minutes' },  
    { maxTime: 240, color: '#99FF99', label: '<= 4 minutes' },  
    { maxTime: 300, color: '#CCFFCC', label: '<= 5 minutes' },  
    { maxTime: 600, color: '#FFFF00', label: '<= 10 minutes' },  
    { maxTime: 900, color: '#FFCC00', label: '<= 15 minutes' },  
    { maxTime: 1200, color: '#FFA500', label: '<= 20 minutes' },  
    { maxTime: 1500, color: '#FF7F50', label: '<= 25 minutes' },  
    { maxTime: 1800, color: '#FF6347', label: '<= 30 minutes' },  
    { maxTime: Infinity, color: '#FF0000', label: '> 30 minutes' },  
  ];  

  let map;

  async function fetchCommuteTimes() {  
    const response = await fetch('/commuteTimes.json');  
    const data = await response.json();  
    return data;  
  }

  function initMap() {  
    map = new google.maps.Map(document.getElementById('map'), {  
      zoom: 13,  
      center: { lat: 51.5074, lng: -0.1278 }, // Center the map on London  
    });

    addDestinations();
    addPolygon();
    createLegend();

    (async () => {  
      const commuteTimes = await fetchCommuteTimes();  
      addHeatMap(commuteTimes, TILE_RESOLUTION);  
    })();  
  }
    
  function addDestinations() {  
    DESTINATIONS.forEach((destination) => {  
      const marker = new google.maps.Marker({  
        position: destination,  
        map: map,  
      });  
    });  
  }  
  
  function addPolygon() {  
    const polygon = new google.maps.Polygon({  
      paths: POLYGON_COORDS,  
      strokeColor: '#FF0000', // Border color  
      strokeOpacity: 0.8, // Border opacity  
      strokeWeight: 2, // Border weight  
      fillColor: '#FFFFFF', // Fill color (set it to the same as the background color for transparency)  
      fillOpacity: 0, // Fill opacity (set it to 0 for transparency)  
      map: map,  
    });  
  }
  
  function createLegend() {  
    const legend = document.createElement('div');  
    legend.id = 'legend';
    legend.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; 
    legend.style.padding = '10px';
  
    TIME_TO_COLOR_MAP.forEach((entry) => {  
      const legendItem = document.createElement('div');  
      legendItem.innerHTML = `<span style="background-color: ${entry.color}; display: inline-block; width: 20px; height: 20px; margin-right: 5px;"></span> ${entry.label}`;  
      legend.appendChild(legendItem);  
    });  
  
    document.body.appendChild(legend);  
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);  
  }
    
  function addHeatMap(commuteTimes, tileResolution) {  
    const heatmapData = [];  
    
    for (const point in commuteTimes) {  
      const pointData = commuteTimes[point];  
      const pointLatLng = point.split(',').map(parseFloat); 
      let commuteTimesForPoint = pointData.rows[0].elements.map(element => {
        if (element.duration) {
          return element.duration.value;
        } else {
          return -1;
        }
      });
      commuteTimesForPoint = commuteTimesForPoint.filter(time => time !== -1);
      if (commuteTimesForPoint.length > 1) {
        const averageCommuteTime = commuteTimesForPoint.reduce((a, b) => a + b) / commuteTimesForPoint.length;
        
        // ignore anything above 30 minutes
        if (averageCommuteTime <= MAX_COMMUTE_TIME_CUTOFF) {
          addColoredTile(new google.maps.LatLng(pointLatLng[0], pointLatLng[1]), averageCommuteTime, tileResolution);
        }
      }
    }  
  }   
    
  function addColoredTile(point, weight, tileResolution) {  
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
    return TIME_TO_COLOR_MAP.find((entry) => time <= entry.maxTime).color;  
  }

  (async () => {  
    initMap();
  })();
};