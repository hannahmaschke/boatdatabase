const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const bcrypt = require('bcryptjs');
const loginCollection = "login";
const { ObjectId } = require('mongodb');
const multer = require("multer");

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
    boatNumber: boatNumber,
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

  const { memberID, name, boatNumber } = req.body;

  const membershipRenewalCollection = db.collection('membership_renewal');
  const membershipCollection = db.collection('membership');
  const memberCollection = db.collection('member');

  // Check if the member exists based on the membership ID
  memberCollection.findOne({ membership_id: memberID })
      .then(member => {
          if (!member) {
              return res.status(404).json({ message: 'Member not found in the database' });
          }

          // Set the new renewal date to one year from today
          const newRenewalDate = new Date();
          newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);

          // Update the membership_renewal collection
          const renewalRecord = {
              name: name,
              memberID: memberID,
              boatNumber: boatNumber,
              renewal_date: newRenewalDate
          };

          return membershipRenewalCollection.insertOne(renewalRecord)
              .then(() => {
                  // Update the renewalDate field in the membership collection
                  return membershipCollection.updateOne(
                      { _id: new ObjectId(memberID) },
                      { $set: { renewalDate: newRenewalDate } }
                  );
              })
              .then(() => {
                  res.status(200).json({ message: 'Membership renewal successful!' });
              });
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
    message: message,
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

// Login route to handle authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the 'login' collection by username
  db.collection(loginCollection).findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // Compare the entered password with the stored hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ success: false, message: 'Error comparing passwords' });
        }

        console.log('Compare result:', result);
        console.log('Provided password:', password);
        console.log('Stored password hash:', user.password);

        if (result) {
          // Password matches
          return res.json({ success: true, message: 'Login successful' });
        } else {
          return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
      });
    })
    .catch(err => res.status(500).json({ success: false, message: 'Error processing request', error: err }));
});

// POST route for creating a membership
app.post('/insert-membership', (req, res) => {
  if (!db) {
    return res.status(500).json({ message: 'Database not connected' });
  }

  const { membershipStatus, membershipType, startDate, renewalDate } = req.body;

  // Create a document for the membership
  const membership = {
      membershipStatus: membershipStatus,
      membershipType: membershipType,
      startDate: startDate,
      renewalDate: renewalDate,
  };

  // Insert the registration into the MongoDB database
  const membershipCollection = db.collection('membership');
  membershipCollection.insertOne(membership)
    .then(result => {
      console.log('Membership registration successful:', result);
      res.status(200).json({ 
          message: 'Membership registration successful!',
          membershipId: result.insertedId.toString() // Return the membershipId
      });
    })
    .catch(error => {
      console.error('Error registering membership:', error);
      res.status(500).json({ message: 'Error registering membership', error: error.message });
    });
});

// POST route for creating a member
app.post('/add-member', (req, res) => {
  if (!db) {
    return res.status(500).json({ message: 'Database not connected' });
  }

  const { first_name, last_name, password, interest, email, phone_number, membership_id, city } = req.body;

  // Create a document for the member
  const member = {
      first_name: first_name,
      last_name: last_name,
      password: password,
      interest: interest,
      email: email,
      phone_number: phone_number,
      membership_id: membership_id,
      city: city
  };

  // Insert the registration into the MongoDB database
  const memberCollection = db.collection('member');
  memberCollection.insertOne(member)
    .then(result => {
      console.log('Member registration successful:', result);
      res.status(200).json({ message: 'Member registration successful!', registrationId: result.insertedId });
    })
    .catch(error => {
      console.error('Error registering member:', error);
      res.status(500).json({ message: 'Error registering member', error: error.message });
    });
});

// POST route for adding a new boat
app.post('/add-boat', (req, res) => {
  if (!db) {
      return res.status(500).json({ message: 'Database not connected' });
  }

  const {
      boat_name,
      boat_type,
      manufacture_year,
      hull_material,
      appraised_value,
      condition,
      era,
      registration_number,
      model_name,
      restoration_description,
      restoration_status,
      brand_name,
      horse_power,
      fuel_type,
      engine_type,
      policy_number,
      notable_history_description,
      feature_name,
      feature_description,
      maintenance_type,
      maintenance_description,
      unique_history_description
  } = req.body;

  const boat = {
      boat_name,
      boat_type,
      manufacture_year,
      hull_material,
      appraised_value,
      condition,
      era,
      registration_number,
      model: { model_name: model_name },
      restoration: { restoration_status: restoration_status, restoration_description: restoration_description },
      engine: { brand_name: brand_name, horse_power: horse_power, fuel_type: fuel_type, engine_type: engine_type},
      insurance: { policy_number: policy_number },
      notable_history: [{ notable_history_description: notable_history_description }],
      unique_features: [{ feature_name: feature_name, feature_description: feature_description }],
      maintenance_records: [{ maintenance_type: maintenance_type, maintenance_description: maintenance_description }],
      unique_history: [{ unique_history_description: unique_history_description }]
  };

  const boatCollection = db.collection('boat');
  boatCollection.insertOne(boat)
      .then(result => {
          res.status(200).json({ message: 'Boat added successfully!', boatId: result.insertedId });
      })
      .catch(error => {
          console.error('Error adding boat:', error);
          res.status(500).json({ message: 'Error adding boat', error: error.message });
      });
});


//------
// Set up multer storage configuration
const upload = multer({
  dest: 'uploads/',  // This is where uploaded photos will be stored temporarily
  limits: {
      fileSize: 10 * 1024 * 1024, // 10MB size limit (optional)
  },
  fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (extname && mimetype) {
          return cb(null, true);
      } else {
          cb(new Error('Only image files are allowed!'));
      }
  }
});
//--------------------
// periodical page
// set up multer for handling file uploads
// Serve static files (like images) from the 'uploads' directory
app.use('/uploads', express.static('uploads'));
const storage = multer.memoryStorage();

app.post('/submit-periodical', upload.single('photo'), (req, res) => {
  const { name, membership_id, text } = req.body;
  const photo = req.file; // Access the uploaded file

  // Check if all fields are provided
  if (!name || !membership_id || !text || !photo) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  // Prepare the periodical data
  const periodicalData = {
      name,
      membership_id,
      text,
      photo_path: photo.path, // Store the photo's path temporarily
  };

  // Save to the MongoDB periodicals collection
  const periodicalsCollection = db.collection('periodicals');
  periodicalsCollection.insertOne(periodicalData)
      .then(() => {
          res.status(200).json({ message: 'Periodical submitted successfully!' });
      })
      .catch(error => {
          console.error('Error submitting periodical:', error);
          res.status(500).json({ message: 'Error submitting periodical.' });
      });
});

// ----------------------
// system for employees to check submitted content
app.get('/get-all-periodicals', (req, res) => {
  const periodicalsCollection = db.collection('periodicals');

  periodicalsCollection.find().toArray()
      .then(periodicals => {
          res.status(200).json(periodicals);
      })
      .catch(error => {
          console.error('Error retrieving periodicals:', error);
          res.status(500).send('Error retrieving periodicals');
      });
});

// ---------
const path = require('path');



// start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
