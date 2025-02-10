import bcrypt from "bcrypt";
const password = "password123";
const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);