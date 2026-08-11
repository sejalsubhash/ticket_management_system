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
    const ticket = await createTicket({
      title, description, priority, category, createdBy: req.user.id, assignedTo,
    });
    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, priority, category, assignedTo, page, limit } = req.query;
    let createdBy;
    if (req.user.role === 'user') {
      createdBy = req.user.id;
    }
    const result = await findTickets({ status, priority, category, assignedTo, createdBy, page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
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
    const comment = await createComment({
      ticketId: req.params.id, userId: req.user.id, userName: req.user.name, text,
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
