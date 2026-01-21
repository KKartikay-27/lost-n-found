import Item from '../models/Item.js';

export const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location } = req.body;
    if (!title || !description || !type || !location) {
      return res.status(400).json({ message: 'title, description, type, and location are required' });
    }
    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      imageUrl: req.body.imageUrl,
      postedBy: req.user.id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Unable to create item', error: err.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const filter = { isResolved: false };
    if (req.query.type) {
      filter.type = req.query.type.toLowerCase();
    }
    // Show both lost and found items to all users
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
    if (!item) return res.sendStatus(404);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Invalid item id', error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.sendStatus(404);
    if (item.postedBy.toString() !== req.user.id) return res.sendStatus(403);

    const allowed = ['title', 'description', 'category', 'type', 'location', 'imageUrl', 'isResolved'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) item[key] = req.body[key];
    }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Unable to update item', error: err.message });
  }
};

export const resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.sendStatus(404);
    if (item.postedBy.toString() !== req.user.id) return res.sendStatus(403);
    item.isResolved = true;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Unable to resolve item', error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.sendStatus(404);
    if (item.postedBy.toString() !== req.user.id) return res.sendStatus(403);
    await item.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ message: 'Unable to delete item', error: err.message });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user items', error: err.message });
  }
};
