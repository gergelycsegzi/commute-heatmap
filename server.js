require('dotenv').config();  
const express = require('express');  
const app = express();  
const port = process.env.PORT || 3000;  
  
app.use(express.static('public'));  
  
app.get('/api-key', (req, res) => {  
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });  
});  
  
app.listen(port, () => {  
  console.log(`Server is running on http://localhost:${port}`);  
});  
