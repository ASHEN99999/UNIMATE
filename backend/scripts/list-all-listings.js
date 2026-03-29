/**
 * List all housing listings in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function listAllListings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get all listings
    const listings = await mongoose.connection.db.collection('housinglistings').find({}).toArray();

    if (listings.length === 0) {
      console.log('\n⚠ No listings found in database');
    } else {
      console.log(`\n✓ Found ${listings.length} listing(s):\n`);
      listings.forEach((listing, index) => {
        console.log(`${index + 1}. ID: ${listing._id}`);
        console.log(`   Title: ${listing.title}`);
        console.log(`   Status: ${listing.status}`);
        console.log(`   Price: Rs.${listing.price}`);
        console.log(`   Created By: ${listing.createdBy}`);
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

listAllListings();
