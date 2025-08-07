const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const plainPass = "admin123";
async function user() {
  const password = async () => {
    const hash = await bcrypt.hash(plainPass, 10);
    console.log("hashed password",hash);
    return hash;
  };

  const userpassword = await password();

  const generateToken = jwt.sign({ password: userpassword }, "divanshu");

  console.log("token",generateToken);

  const payload = jwt.verify(generateToken, "divanshu");
  console.log("payload: ",payload);
}
user()
