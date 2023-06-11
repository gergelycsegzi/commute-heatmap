const tileResolution = 200; // Tile resolution in square meters  
    
  if (typeof module !== "undefined") {  
    module.exports = { tileResolution };  
  } else {  
    window.tileResolution = tileResolution;  
  }  
  