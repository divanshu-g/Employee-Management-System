const bcrypt = require('bcrypt');

// Replace with the exact hash from your DB for this user:
const hashedPasswordFromDB = '$2b$10$DtcKjgplRtrjdkq9Vy8OMu7LBGt0ubvMNl8UtIyUtaeubtf0HFsx.';
const plainPassword = 'admin123';

async function hashPassword() {
  const hashpass = await bcrypt.hash('admin123', 10);
  console.log(hashpass);
}

hashPassword();


bcrypt.compare(plainPassword, hashedPasswordFromDB, (err, result) => {
  if(err) throw err;
  console.log('Password match?', result);
});
