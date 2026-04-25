/**
 * Quick script to approve a specific housing listing
 * Usage: node scripts/approve-listing.js <listingId>
 */

require('dotenv').config();
const mongoose = require('mongoose');

const LISTING_ID = process.argv[2] || '69bfa7657dcc807ec5c64baf';

async function approveListing() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Update the listing
    const result = await mongoose.connection.db.collection('housinglistings').updateOne(
      { _id: new mongoose.Types.ObjectId(LISTING_ID) },
      { 
        $set: { 
          status: 'active',
          approvedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('✗ Listing not found with ID:', LISTING_ID);
    } else if (result.modifiedCount > 0) {
      console.log('✓ Listing approved successfully!');
      console.log('  Status changed to: active');
    } else {
      console.log('✓ Listing was already active');
    }

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

approveListing();
