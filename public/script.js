function init() {  
  const tileResolution = 100; 
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

    (async () => {  
      const commuteTimes = await fetchCommuteTimes();  
      addHeatMap(commuteTimes, tileResolution);  
    })();  
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
        if (averageCommuteTime < 1800) {
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
    // Customize this function to return a color based on the commute time  
    if (time <= 60) {  
      return "#00FF00"; // Green for <= 1 minute  
    } else if (time <= 120) {  
      return "#33FF33"; // Light green for <= 2 minutes  
    } else if (time <= 180) {  
      return "#66FF66"; // Lighter green for <= 3 minutes  
    } else if (time <= 240) {  
      return "#99FF99"; // Even lighter green for <= 4 minutes  
    } else if (time <= 300) {  
      return "#CCFFCC"; // Very light green for <= 5 minutes  
    } else if (time <= 600) {  
      return "#FFFF00"; // Yellow for <= 10 minutes  
    } else if (time <= 900) {  
      return "#FFCC00"; // Light orange for <= 15 minutes  
    } else if (time <= 1200) {  
      return "#FFA500"; // Orange for <= 20 minutes  
    } else if (time <= 1500) {  
      return "#FF7F50"; // Coral for <= 25 minutes  
    } else if (time <= 1800) {  
      return "#FF6347"; // Tomato for <= 30 minutes  
    } else {  
      return "#FF0000"; // Red for > 30 minutes  
    }  
  }    

  (async () => {  
    initMap();
  })();
};