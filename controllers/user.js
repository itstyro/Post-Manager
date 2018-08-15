const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const asyncMiddleware = require('../catchAsync');
const User = require('../models/user');

exports.createUser = asyncMiddleware(async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash
    });
    const result = await user.save();
    res.status(201).json({
      message: 'User created successfully!',
      result: result
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: {
        message: 'Inavalid authentication credentials!'
      }
    });
  }
});

exports.login = asyncMiddleware(async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) {
      return res.status(401).json({
        message: 'Auth failed'
      });
    }
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Auth failed'
      });
    }
    const token = jwt.sign({
        email: user.email,
        id: user._id
      },
      process.env.JWT_KEY, {
        expiresIn: '1h'
      });
    res.status(200).json({
      token,
      expiresIn: 3600,
      userId: user._id
    });
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid Authentication Credentials!'
    });
  }
});
