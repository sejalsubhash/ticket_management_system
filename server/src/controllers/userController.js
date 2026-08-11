const { findAll, findById, updateUser } = require('../models/user');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await findAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'agent', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin, agent, or user' });
    }
    const user = await updateUser(req.params.id, { role });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
