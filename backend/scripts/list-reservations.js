/**
 * List all reservations in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function listAllReservations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get all reservations
    const reservations = await mongoose.connection.db.collection('reservations').find({}).toArray();

    if (reservations.length === 0) {
      console.log('\n⚠ No reservations found in database');
    } else {
      console.log(`\n✓ Found ${reservations.length} reservation(s):\n`);
      reservations.forEach((res, index) => {
        console.log(`${index + 1}. ID: ${res._id}`);
        console.log(`   Listing: ${res.listingId}`);
        console.log(`   Student: ${res.studentId}`);
        console.log(`   Status: ${res.status}`);
        console.log(`   Message: ${res.message || 'N/A'}`);
        console.log(`   Move-in: ${res.moveInDate || 'N/A'}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

listAllReservations();
