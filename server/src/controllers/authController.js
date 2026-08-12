const jwt = require('jsonwebtoken');
const config = require('../config');
const { createUser, findByEmail, findById, comparePassword, updateUser } = require('../models/user');

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, department } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await createUser({ email, password, name, department });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const user = await findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await updateUser(req.user.id, { password: newPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (department !== undefined) updates.department = department;
    const user = await updateUser(req.user.id, updates);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
