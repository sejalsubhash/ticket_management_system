const { getDefaultCollection, getCluster } = require('../config/couchbase');
const { v4: uuidv4 } = require('uuid');

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['hardware', 'software', 'network', 'access', 'email', 'other'];

async function createTicket({ title, description, priority = 'medium', category = 'other', createdBy, assignedTo = null, attachments = [] }) {
  const collection = await getDefaultCollection();
  const id = `ticket::${uuidv4()}`;
  const doc = {
    type: 'ticket',
    title,
    description,
    status: 'open',
    priority,
    category,
    createdBy,
    assignedTo,
    attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await collection.upsert(id, doc);
  return { id, ...doc };
}

async function findTickets({ search, status, priority, category, assignedTo, createdBy, startDate, endDate, page = 1, limit = 20 } = {}) {
  const { cluster } = await getCluster();
  let where = ["t.type = 'ticket'"];
  const params = [];

  if (search) { where.push(`(LOWER(t.title) LIKE LOWER($${params.length + 1}) OR LOWER(t.description) LIKE LOWER($${params.length + 1}))`); params.push(`%${search}%`); }
  if (status) { where.push(`t.status = $${params.length + 1}`); params.push(status); }
  if (priority) { where.push(`t.priority = $${params.length + 1}`); params.push(priority); }
  if (category) { where.push(`t.category = $${params.length + 1}`); params.push(category); }
  if (assignedTo) { where.push(`t.assignedTo = $${params.length + 1}`); params.push(assignedTo); }
  if (createdBy) { where.push(`t.createdBy = $${params.length + 1}`); params.push(createdBy); }
  if (startDate) { where.push(`t.createdAt >= $${params.length + 1}`); params.push(startDate); }
  if (endDate) { where.push(`t.createdAt <= $${params.length + 1}`); params.push(endDate); }

  const offset = (page - 1) * limit;
  const query = `SELECT META().id as id, t.* FROM \`travel-sample\`._default._default t WHERE ${where.join(' AND ')} ORDER BY t.createdAt DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await cluster.query(query, { parameters: params });
  const rows = await result.rows;

  const countQuery = `SELECT COUNT(*) as total FROM \`travel-sample\`._default._default t WHERE ${where.join(' AND ')}`;
  const countResult = await cluster.query(countQuery, { parameters: params.slice(0, -2) });
  const countRows = await countResult.rows;

  return { tickets: rows, total: countRows[0]?.total || 0, page, limit };
}

async function findTicketById(id) {
  const collection = await getDefaultCollection();
  try {
    const result = await collection.get(id);
    return { id, ...result.value };
  } catch {
    return null;
  }
}

async function updateTicket(id, updates) {
  const collection = await getDefaultCollection();
  const existing = await collection.get(id);
  const updated = { ...existing.value, ...updates, updatedAt: new Date().toISOString() };
  await collection.upsert(id, updated);
  return { id, ...updated };
}

async function deleteTicket(id) {
  const collection = await getDefaultCollection();
  await collection.remove(id);
}

async function getStats() {
  const { cluster } = await getCluster();

  const statusQuery = `SELECT t.status, COUNT(*) as count FROM \`travel-sample\`._default._default t WHERE t.type = 'ticket' GROUP BY t.status`;
  const priorityQuery = `SELECT t.priority, COUNT(*) as count FROM \`travel-sample\`._default._default t WHERE t.type = 'ticket' GROUP BY t.priority`;
  const categoryQuery = `SELECT t.category, COUNT(*) as count FROM \`travel-sample\`._default._default t WHERE t.type = 'ticket' GROUP BY t.category`;
  const totalQuery = `SELECT COUNT(*) as total FROM \`travel-sample\`._default._default t WHERE t.type = 'ticket'`;
  const recentQuery = `SELECT META().id as id, t.* FROM \`travel-sample\`._default._default t WHERE t.type = 'ticket' ORDER BY t.createdAt DESC LIMIT 5`;

  const [statusResult, priorityResult, categoryResult, totalResult, recentResult] = await Promise.all([
    cluster.query(statusQuery),
    cluster.query(priorityQuery),
    cluster.query(categoryQuery),
    cluster.query(totalQuery),
    cluster.query(recentQuery),
  ]);

  return {
    total: (await totalResult.rows)[0]?.total || 0,
    byStatus: (await statusResult.rows).reduce((acc, r) => { acc[r.status] = r.count; return acc; }, {}),
    byPriority: (await priorityResult.rows).reduce((acc, r) => { acc[r.priority] = r.count; return acc; }, {}),
    byCategory: (await categoryResult.rows).reduce((acc, r) => { acc[r.category] = r.count; return acc; }, {}),
    recent: (await recentResult.rows),
  };
}

module.exports = { createTicket, findTickets, findTicketById, updateTicket, deleteTicket, getStats, STATUSES, PRIORITIES, CATEGORIES };
