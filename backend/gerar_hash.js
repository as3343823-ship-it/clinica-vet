const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin123', 10));
console.log(bcrypt.hashSync('12345678', 10));