const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  createUser: async ({ userInput: { email, password } }) => {
    try {
      //check if the email already exists in the database
      const existingUser = await User.findOne({ email: email })

      if (existingUser) {
        throw new Error('User exists already.');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email: email,
        password: hashedPassword
      });

      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    // successful authentication credentials
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET,
      { expiresIn: '1h' }
    );

    return { userId: user.id, token: token, tokenExpiration: 1, email: user.email }
  }
}
