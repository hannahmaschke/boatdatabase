const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all IP addresses to make requests
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type'] 
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB Atlas connection string 
const url = 'mongodb+srv://hannahmaschke:INFT3201@boatcluster.vg72m.mongodb.net/boatdatabase?retryWrites=true&w=majority';
let db;

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB Atlas');
    db = client.db('boatdatabase');  
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

 
// Route to handle event registration
app.post('/event-registration', (req, res) => {
  if (!db) {
    return res.status(500).json({ message: 'Database not connected' });
  }

  const { name, email, event } = req.body;


  // Create a document for the event registration
  const registration = {
    name: name,
    email: email,
    event: event,
    registration_date: new Date(),
  };

  // Insert the registration into the MongoDB database
  const eventRegistrationCollection = db.collection('event_registration');
  eventRegistrationCollection.insertOne(registration)
    .then(result => {
      console.log('Registration successful:', result);
      res.status(200).json({ message: 'Registration successful!', registrationId: result.insertedId });
    })
    .catch(error => {
      console.error('Error registering for event:', error);
      res.status(500).json({ message: 'Error registering for event', error: error.message });
    });
});

// ---------------------------------
// // Route to handle boat number registration
app.post('/number-registration', (req, res) => {
    if (!db) {
      return res.status(500).json({ message: 'Database not connected' });
    }
  
    const { name, boatNumber } = req.body;
  
  
    // Create a document for the boat number registration
    const boatRegistration = {
      name: name,
      boatNumber : boatNumber,
      registration_date: new Date(),
    };
  
    // Insert the registration into the MongoDB database
    const boatRegistrationCollection = db.collection('number_registration');
    boatRegistrationCollection.insertOne(boatRegistration)
      .then(result => {
        console.log('Registration successful:', result);
        res.status(200).json({ message: 'Registration successful!', registrationId: result.insertedId });
      })
      .catch(error => {
        console.error('Error registering for event:', error);
        res.status(500).json({ message: 'Error registering boat number', error: error.message });
      });
  });

  // ---------------------------------
 // Route to handle membership renewal
app.post('/membership-renewal', (req, res) => {
    if (!db) {
      return res.status(500).json({ message: 'Database not connected' });
    }
  
    const { name, boatNumber, memberID } = req.body;
  
  
    // Create a document for the membership renewal
    const membershipRenewal = {
      name: name,
      memberID: memberID,
      boatNumber : boatNumber,
      renewal_date: new Date()
    };
  
    // Insert the renewal into the MongoDB database
    const membershipRenewalCollection = db.collection('membership_renewal');
    membershipRenewalCollection.insertOne(membershipRenewal)
      .then(result => {
        console.log('Membership renewal successful:', result);
        res.status(200).json({ message: 'Membership renewal successful!', registrationId: result.insertedId });
      })
      .catch(error => {
        console.error('Error renewing membership:', error);
        res.status(500).json({ message: 'Error renewing membership', error: error.message });
      });
  });

  // ---------------------------------
 // Route to contact form submission
app.post('/contact', (req, res) => {
    if (!db) {
      return res.status(500).json({ message: 'Database not connected' });
    }
  
    const { name, email, message } = req.body;
  
  
    // Create a document for the contact form messages
    const contactForm = {
      name: name,
      email: email,
      message : message,
      contact_date: new Date()
    };
  
    // Insert the submission into the MongoDB database
    const contactFormCollection = db.collection('contact_form');
    contactFormCollection.insertOne(contactForm)
      .then(result => {
        //console.log('Membership renewal successful:', result);
        res.status(200).json({ message: 'Message sent successfully', registrationId: result.insertedId });
      })
      .catch(error => {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
      });
  });

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
