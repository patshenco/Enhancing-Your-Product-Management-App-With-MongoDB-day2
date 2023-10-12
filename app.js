const express = require('express');
const{connectToDb, getDb} = require('./db')
const app = express();
const bodyParser = require('body-parser');
let db 
connectToDb((err)=>{
if (!err){
  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
  db = getDb()
}
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
// get products
app.get('/products', async (req, res) => {
  let products = await db.collection('produit')
  .find().toArray();
    res.send(products)
});

// Serve the "Advanced Search" page
app.get('/advanced-search', (req, res) => {
    res.render('advanced-search')
});

// Handle the advanced search query
app.post('/advanced-search', async (req, res) => {
    const { keyword, minPrice, maxPrice } = req.body;

    const query = {};

    if (keyword) {
        query.name = { $regex: new RegExp(keyword, 'i') };
    }
    

    if (minPrice && maxPrice) {
        query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    } else if (minPrice) {
        query.price = { $gte: parseFloat(minPrice) };
    } else if (maxPrice) {
        query.price = { $lte: parseFloat(maxPrice) };
    }
     
    try {
        const products = await db.collection('produit').find(query).toArray();
       if (products.length == 0){
         res.send("No products match the specified criteria.")
       }else{
           
           res.json({ products });
       }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

