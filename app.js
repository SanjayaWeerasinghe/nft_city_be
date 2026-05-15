const path = require('path');
if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: path.resolve(process.cwd(), process.env.NODE_ENV || '.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require('mongoose');
const { SERVER_PORT, MONGO_URL } = require('./config')
const router = require('./routes/index');
const { connectToDatabaseCustomerDB } = require('./db/connection');
const fileUpload = require('express-fileupload');

const { newNucConnection } = require('./db/blockchain');


console.log("MONGO_URL", MONGO_URL)

let app = express();
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connectToMongo = async () => {
  try {
    mongoose.connect(MONGO_URL);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Retrying connection to MongoDB...');
    setTimeout(connectToMongo, 5000);
  }
};

// Call function to connect to MongoDB
connectToMongo();


connectToDatabaseCustomerDB().then((threadId) => {
  console.log(`Connected with Database! Thread ID ${threadId}`, 'green');
}).catch((err) => {
  console.error('Failed to connect to Customer DB after all retries:', err.message);
  console.log('The application will continue to attempt reconnection on connection loss.');
});


newNucConnection(process.env.WS_URI_NUC).then(() => {
  console.log('Connected to NUC Blockchain!', 'green');
}).catch(e => {
  console.log(`Error connection to NUC blockchain: ${e.message}`, 'red');
});




app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}));
app.get('/', (req, res) => {
  res.send("Version 2 of nft-city is running")

})

app.use('/nft-city/api/v1', router);



let server = http.createServer(app);


server.listen(SERVER_PORT || 2700, '0.0.0.0', () => {
  console.log(`Wallet service is listening on port ${SERVER_PORT || 2700}`);
});