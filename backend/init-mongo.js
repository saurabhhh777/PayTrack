// MongoDB initialization script
db = db.getSiblingDB('veerabook');

// Create collections
db.createCollection('users');
db.createCollection('workers');
db.createCollection('payments');
db.createCollection('attendance');
db.createCollection('cultivations');
db.createCollection('properties');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.workers.createIndex({ "name": 1 });
db.workers.createIndex({ "isActive": 1 });

db.payments.createIndex({ "workerId": 1, "date": -1 });
db.payments.createIndex({ "date": -1 });
db.payments.createIndex({ "paymentMode": 1 });

db.attendance.createIndex({ "workerId": 1, "date": 1 }, { unique: true });
db.attendance.createIndex({ "date": -1 });
db.attendance.createIndex({ "status": 1 });

db.cultivations.createIndex({ "cropName": 1 });
db.cultivations.createIndex({ "cultivationDate": -1 });
db.cultivations.createIndex({ "paymentMode": 1 });

db.properties.createIndex({ "propertyType": 1 });
db.properties.createIndex({ "transactionDate": -1 });
db.properties.createIndex({ "partnerName": 1 });

print('VeeraBook database initialized successfully!'); 