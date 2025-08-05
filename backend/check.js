const bcrypt = require('bcrypt');

// Replace with the exact hash from your DB for this user:
const hashedPasswordFromDB = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8whXwol4xv/teOmgp3WhtFtX3Ux0aO';
const plainPassword = 'mySecret123';

bcrypt.compare(plainPassword, hashedPasswordFromDB, (err, result) => {
  if(err) throw err;
  console.log('Password match?', result);
});
