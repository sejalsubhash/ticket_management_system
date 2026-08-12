const { createTicket, findTickets, findTicketById, updateTicket, deleteTicket, getStats, STATUSES, PRIORITIES, CATEGORIES } = require('../models/ticket');
const { createComment, findCommentsByTicket } = require('../models/comment');

exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, category, assignedTo } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Priority must be one of: ${PRIORITIES.join(', ')}` });
    }
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }
    const attachments = (req.files || []).map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));
    const ticket = await createTicket({
      title, description, priority, category, createdBy: req.user.id, assignedTo, attachments,
    });
    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, priority, category, assignedTo, startDate, endDate, page, limit } = req.query;
    let createdBy;
    if (req.user.role === 'user') {
      createdBy = req.user.id;
    }
    const result = await findTickets({ status, priority, category, assignedTo, createdBy, startDate, endDate, page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const ticket = await findTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const comments = await findCommentsByTicket(req.params.id);
    res.json({ ticket, comments });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const ticket = await findTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const { status, priority, category, assignedTo, title, description } = req.body;
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Priority must be one of: ${PRIORITIES.join(', ')}` });
    }
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (category) updates.category = category;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;

    const updated = await updateTicket(req.params.id, updates);
    res.json({ ticket: updated });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const ticket = await findTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    await deleteTicket(req.params.id);
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const ticket = await findTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    const attachments = (req.files || []).map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));
    const comment = await createComment({
      ticketId: req.params.id, userId: req.user.id, userName: req.user.name, text, attachments,
    });
    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await findCommentsByTicket(req.params.id);
    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.bulkCreate = async (req, res, next) => {
  try {
    const { tickets } = req.body;
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ error: 'Tickets array is required' });
    }
    if (tickets.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 tickets per import' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < tickets.length; i++) {
      const { title, description, priority, category, assignedTo } = tickets[i];
      if (!title || !description) {
        errors.push({ index: i, error: 'Title and description are required' });
        continue;
      }
      if (priority && !PRIORITIES.includes(priority)) {
        errors.push({ index: i, error: `Invalid priority: ${priority}` });
        continue;
      }
      if (category && !CATEGORIES.includes(category)) {
        errors.push({ index: i, error: `Invalid category: ${category}` });
        continue;
      }
      try {
        const ticket = await createTicket({
          title, description, priority, category, createdBy: req.user.id, assignedTo,
        });
        results.push(ticket);
      } catch (err) {
        errors.push({ index: i, error: err.message });
      }
    }

    res.status(201).json({
      imported: results.length,
      failed: errors.length,
      errors,
      tickets: results,
    });
  } catch (error) {
    next(error);
  }
};
