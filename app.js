import express from 'express';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import session from 'express-session';
import users from './users.json' assert { type: 'json' };
import stuffedAnimalData from './stuffed-animal-data.json' assert { type: 'json' };

const app = express();
const port = '8000';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));

nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/all-animals', (req, res) => {
  res.render('all-animals.html.njk', { animals: Object.values(stuffedAnimalData) });
});

app.get('/animal-details/:animalId', (req, res) => {
  let {animalId} = req.params
  res.render('animal-details.html.njk', { animal: getAnimalDetails(animalId) });

});


app.get('/add-to-cart/:animalId', (req, res) => {
  // TODO: Finish add to cart functionality
  // The logic here should be something like:
  // - check if a "cart" exists in the session, and create one (an empty
  // object keyed to the string "cart") if not
  // - check if the desired animal id is in the cart, and if not, put it in
  // - increment the count for that animal id by 1
  // - redirect the user to the cart page
let {animalId} = req.params
let sess = req.session;

console.log(sess);

if (!sess.cart){
     sess.cart = {};
}

if (!sess.cart[animalId]){
    sess.cart[animalId] = 0;
}
  sess.cart[animalId]++;
  console.log(sess.cart[animalId]);
  res.redirect('/cart');
});

//   // TODO: Display the contents of the shopping cart.
//   // The logic here will be something like:

app.get('/cart', (req, res) => {
  let sess = req.session;

if (!sess.cart){
    sess.cart = {};
}
console.log(sess);
console.log("/cart hit");
  let cart = sess.cart;
  console.log(cart);
  let arrAnimals = [];
  let cartTotal = 0;

  for(let animal in cart){
    console.log(cart, "hi");
    const qty = sess.cart[animal]
    console.log(animal);

    let animalData = getAnimalDetails(animal)
    cartTotal+=qty*animalData.price
    animalData.qty = qty
    animalData.subTotalCost = qty*animalData.price
    arrAnimals.push(animalData)

    console.log(qty);
    console.log(animalData);
  }

  res.render('cart.html.njk', {arrAnimals, cartTotal});
});


app.get('/checkout', (req, res) => {
  // Empty the cart.
  req.session.cart = {};
  res.redirect('/all-animals');
});

app.get('/login', (req, res) => {
  res.render('login.html.njk');
});

app.post('/process-login', (req, res) => {
  for(let user of users){
    console.log(users);
    if (req.body.username === user.username && req.body.password === user.password){
      res.redirect('/all-animals');
      return;
    }
  }
  res.render('login.html.njk', { message: 'Invalid username or password' });
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  res.render('index.html');
});
});

app.get('/back-to-shop', (req, res) => {
  res.render('all-animals.html.njk');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
