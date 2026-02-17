require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const logFile = 'connection-test.log';

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

// Clear previous log
if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
}

log('=== MongoDB Connection Test ===');
log('Time: ' + new Date().toISOString());
log('Connection URI (censored): ' + process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
    serverSelectionTimeoutMS: 10000
};

log('\nAttempting connection...');

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => {
        log('\n✅ SUCCESS: Connected to MongoDB!');
        log('Database: ' + mongoose.connection.db.databaseName);
        log('Host: ' + mongoose.connection.host);
        setTimeout(() => process.exit(0), 1000);
    })
    .catch((error) => {
        log('\n❌ FAILED: MongoDB connection error');
        log('Error Type: ' + error.constructor.name);
        log('Error Name: ' + error.name);
        log('Error Message: ' + error.message);

        if (error.reason) {
            log('\nDetailed Reason:');
            log(JSON.stringify(error.reason, null, 2));
        }

        log('\n💡 Troubleshooting Tips:');
        log('  1. Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for testing)');
        log('  2. Check username/password are correct');
        log('  3. Ensure cluster is not paused');
        log('  4. Check Windows Firewall settings');

        log('\nFull Error Object:');
        log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        setTimeout(() => process.exit(1), 1000);
    });
