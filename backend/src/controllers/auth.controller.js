import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalizedEmail, passwordHash: hash, phone });
    const safeUser = { id: user._id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt };
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.sendStatus(401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.sendStatus(401);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { id: user._id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt };
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(400).json({ message: 'Login failed', error: err.message });
  }
};

export const verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(401);
    const safeUser = { id: user._id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt };
    res.json(safeUser);
  } catch (err) {
    res.status(400).json({ message: 'Token verification failed', error: err.message });
  }
};
