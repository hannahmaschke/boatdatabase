// const bcrypt = require('bcryptjs');

// const password = 'INFT3201'; // Your plaintext password

// bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) {
//         console.error('Error hashing password:', err);
//     } else {
//         console.log('New hashed password:', hashedPassword);
//     }
// });

const bcrypt = require('bcryptjs');

// The provided plaintext password
const plaintextPassword = 'INFT3201';
// The stored hashed password from your database
const storedHash = '$2b$10$kJWY2C5QNaUbGVLD54oTRuvnS3tr/y0v8BhLB/F5vQv1gMJ8di8Sq';

bcrypt.compare(plaintextPassword, storedHash, (err, result) => {
    if (err) {
        console.error('Error comparing passwords:', err);
    } else {
        console.log('Do the passwords match?', result); // Should log true if the hash is correct
    }
});