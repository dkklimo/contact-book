const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
});

module.exports = mongoose.model('Contact', contactSchema);
