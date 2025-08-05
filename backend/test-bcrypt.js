
const bcrypt = require('bcrypt');

async function generateHash() {
  const plainPassword = 'Admin123'; // Replace with desired password
  const saltRounds = 10; // Typical secure cost factor

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
  } catch (err) {
    console.error('Error generating hash:', err);
  }
}

generateHash();
