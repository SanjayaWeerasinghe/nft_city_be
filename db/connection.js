const mysql = require('mysql2');

console.log("Dataa", process.env.CUSTOMER_DB_PASSWORD);

const dbConfig = {
    host: process.env.CUSTOMER_DB_HOST,
    user: process.env.CUSTOMER_DB_USER,
    password: "R$zItikAmC$#4&G$ns",
    database: process.env.CUSTOMER_DB_NAME,
    // Fix SSL issue - set rejectUnauthorized to false for self-signed certificates
    ssl: process.env.CUSTOMER_DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool instead of single connection
const connectionCustomerDB = mysql.createPool(dbConfig);

// Handle pool errors
connectionCustomerDB.on('error', (err) => {
    console.error('❌ Customer DB Pool error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 Connection lost. Pool will automatically reconnect...');
    } else if (err.code === 'ECONNRESET') {
        console.log('🔄 Connection reset. Pool will handle reconnection...');
    } else {
        console.error('Unhandled pool error:', err);
    }
});

const connectToDatabaseCustomerDB = (retries = 5, delay = 5000) => {
    return new Promise((resolve, reject) => {
        const attemptConnection = (attemptNumber) => {
            console.log(`🔌 Testing Customer DB connection... (Attempt ${attemptNumber}/${retries})`);

            // Test the pool connection
            connectionCustomerDB.getConnection((err, connection) => {
                if (err) {
                    console.error(`❌ Customer DB connection failed (Attempt ${attemptNumber}/${retries}):`, err.message);
                    console.error('Customer DB Error Code:', err.code);

                    if (attemptNumber < retries) {
                        const nextDelay = delay * Math.pow(1.5, attemptNumber - 1); // Exponential backoff
                        console.log(`⏳ Retrying in ${nextDelay / 1000} seconds...`);
                        setTimeout(() => {
                            attemptConnection(attemptNumber + 1);
                        }, nextDelay);
                    } else {
                        console.error('❌ All connection attempts failed. Giving up.');
                        return reject(err);
                    }
                } else {
                    console.log('✅ Customer DB Pool is connected successfully! Thread ID:', connection.threadId);
                    const threadId = connection.threadId;

                    // Release connection back to pool
                    connection.release();

                    // Store pool globally
                    global.connectionCustomerDB = connectionCustomerDB;
                    resolve(threadId);
                }
            });
        };

        attemptConnection(1);
    });
};


module.exports = {
    connectToDatabaseCustomerDB: connectToDatabaseCustomerDB,
    closeDB: () => global.connection.destroy()
}