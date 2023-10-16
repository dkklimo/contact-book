const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Contact = require('./models/contact'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb+srv://contactbook:contactbook@cluster0.hq0syzo.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



// //seed data to database
// const dummyContacts = [
//     { name: 'John Doe', phoneNumber: '1234567890' },
//     { name: 'Jane Smith', phoneNumber: '9876543210' },
//     { name: 'Alice Johnson', phoneNumber: '5555555555' },
//   ];
  
//   // Function to insert dummy contacts into the database
//   async function seedContacts() {
//     try {
//       await Contact.insertMany(dummyContacts);
//       console.log('Dummy contacts inserted successfully.');
//     } catch (error) {
//       console.error('Error seeding contacts:', error);
//     } finally {
//       mongoose.disconnect(); // Close the MongoDB connection
//     }
//   }
  
//   // Call the seedContacts function to insert data
//   seedContacts();


  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




// Fetch all contacts
app.get('/contacts', async (req, res) => {
    try {
      const contacts = await Contact.find({}); 
  
      // Prepare the response
      const decryptedContacts = contacts.map(contact => ({
        name: contact.name,
        phoneNumber: contact.phoneNumber, // Decrypt the phone number if it's stored in an encrypted form
      }));
  
      res.json(decryptedContacts);
    } catch (error) {
      res.status(500).send('Error fetching contacts');
    }
  });
  
// Create a new contact (Consume, encrypt, and store data)
// app.post('/contacts', async (req, res) => {
//     try {
//       const { name, phoneNumber } = req.body;
//       const encryptedPhoneNumber = await bcrypt.hash(phoneNumber, 10);
  
//       const contact = new Contact({
//         name,
//         phoneNumber: encryptedPhoneNumber,
//       });
  
//       contact.save((err, savedContact) => {
//         if (err) {
//           res.status(500).send('Error creating contact' + error.message);
//         } else {
//           res.status(201).json(savedContact);
//         }
//       });
//     } catch (error) {
//       res.status(500).send('Error creating contact' + error.message);
//     }
//   });

app.post('/contacts', async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).send('Phone number is required.');
        }

        // Hash the phoneNumber using bcrypt
        const hashedPhoneNumber = await bcrypt.hash(phoneNumber, 10);

        const contact = new Contact({
            name,
            phoneNumber: hashedPhoneNumber,
        });

        contact.save((err, savedContact) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error creating contact: ' + err.message);
            } else {
                res.status(201).json(savedContact);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating contact: ' + error.message);
    }
});



  
  // Fetch and decrypt data

app.get('/contacts/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      if (!isValidObjectId) {
        return res.status(400).send('Invalid contact ID');
      }
  
      const contact = await Contact.findById(id);
  
      if (!contact) {
        return res.status(404).send('Contact not found');
      }
  
      // Ensure req.query.phoneNumber contains the data to compare
      const phoneNumberToCompare = req.query.phoneNumber;
  
      if (!phoneNumberToCompare) {
        return res.status(400).send('Phone number to compare is missing');
      }
  
      // Use bcrypt.compare to compare the provided phone number with the hashed one
      const isMatch = await bcrypt.compare(phoneNumberToCompare, contact.phoneNumber);
  
      if (!isMatch) {
        return res.status(403).send('Access denied');
      }
  
      // If the comparison succeeds, you can send the contact details in the response
      res.json({
        name: contact.name,
        phoneNumber: phoneNumberToCompare, // Sending the provided phone number, not the hashed one
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching contact');
    }
  });
  
  
  
  // Update data
  
app.put('/contacts/:id', async (req, res) => {
    const id = req.params.id;
    const { name, phoneNumber } = req.body;
  
    try {
      // Hash the new phone number
      const hashedPhoneNumber = await bcrypt.hash(phoneNumber, 10);
  
      // Find and update the contact by its ID
      const updatedContact = await Contact.findByIdAndUpdate(
        id,
        { name, phoneNumber: hashedPhoneNumber },
        { new: true }
      );
  
      if (!updatedContact) {
        return res.status(404).send('Contact not found');
      }
  
      res.json(updatedContact);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating contact');
    }
  });
  

  // Delete data
  app.delete('/contacts/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const deletedContact = await Contact.findByIdAndRemove(id);
  
      if (!deletedContact) {
        return res.status(404).send('Contact not found');
      }
  
      res.json(deletedContact);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting contact');
    }
  });
  
  



