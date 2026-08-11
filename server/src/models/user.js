const { getDefaultCollection, getCluster } = require('../config/couchbase');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function createUser({ email, password, name, role = 'user', department = '' }) {
  const collection = await getDefaultCollection();
  const id = `user::${uuidv4()}`;
  const hashedPassword = await bcrypt.hash(password, 12);
  const doc = {
    type: 'user',
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    role,
    department,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await collection.upsert(id, doc);
  const { password: _, ...userWithoutPassword } = doc;
  return { id, ...userWithoutPassword };
}

async function findByEmail(email) {
  const { cluster } = await getCluster();
  const query = `SELECT META().id as id, u.* FROM \`travel-sample\`._default._default u WHERE u.email = $1 AND u.type = 'user' LIMIT 1`;
  const result = await cluster.query(query, { parameters: [email.toLowerCase()] });
  const rows = await result.rows;
  return rows.length > 0 ? rows[0] : null;
}

async function findById(id) {
  const collection = await getDefaultCollection();
  try {
    const result = await collection.get(id);
    const { password: _, ...userWithoutPassword } = result.value;
    return { id, ...userWithoutPassword };
  } catch {
    return null;
  }
}

async function findAll() {
  const { cluster } = await getCluster();
  const query = `SELECT META().id as id, u.* FROM \`travel-sample\`._default._default u WHERE u.type = 'user' ORDER BY u.createdAt DESC`;
  const result = await cluster.query(query);
  const rows = await result.rows;
  return rows.map(({ password, ...user }) => user);
}

async function updateUser(id, updates) {
  const collection = await getDefaultCollection();
  const existing = await collection.get(id);
  const updated = { ...existing.value, ...updates, updatedAt: new Date().toISOString() };
  if (updates.password) {
    updated.password = await bcrypt.hash(updates.password, 12);
  }
  await collection.upsert(id, updated);
  const { password: _, ...userWithoutPassword } = updated;
  return { id, ...userWithoutPassword };
}

async function comparePassword(candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
}

module.exports = { createUser, findByEmail, findById, findAll, updateUser, comparePassword };
