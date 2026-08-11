const { getCollection } = require('../config/couchbase');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'comments';

async function createComment({ ticketId, userId, userName, text }) {
  const collection = await getCollection('_default', COLLECTION);
  const id = `comment::${uuidv4()}`;
  const doc = {
    type: 'comment',
    ticketId,
    userId,
    userName,
    text,
    createdAt: new Date().toISOString(),
  };
  await collection.upsert(id, doc);
  return { id, ...doc };
}

async function findCommentsByTicket(ticketId) {
  const { cluster } = await require('../config/couchbase').getCluster();
  const query = `SELECT META().id as id, c.* FROM \`travel-sample\`._default.comments c WHERE c.ticketId = $1 AND c.type = 'comment' ORDER BY c.createdAt ASC`;
  const result = await cluster.query(query, { parameters: [ticketId] });
  return result.rows;
}

async function deleteComment(id) {
  const collection = await getCollection('_default', COLLECTION);
  await collection.remove(id);
}

module.exports = { createComment, findCommentsByTicket, deleteComment };
