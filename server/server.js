import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js';
import PointHistory from './models/PointHistory.js';

/**
 * Express Server Configuration
 * Handles game logic and database operations
 */

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect('mongodb+srv://mdsaifop1:VUqHVwYK2srUbzKA@cluster0.thfkptv.mongodb.net/');

/**
 * Initial Data Setup
 * Populates database with default users if empty
 */
const initialUsers = [
  'Rahul', 'Kamal', 'Sanak', 'Amit', 'Priya', 'Neha', 'Vikas', 'Anjali', 'Rohit', 'Simran'
];

mongoose.connection.once('open', async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany(initialUsers.map(username => ({ username })));
    console.log('Inserted initial users');
  }
});

/**
 * API Routes
 */

// Get sorted leaderboard
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new player
app.post('/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Award points to player
app.post('/claim-points', async (req, res) => {
  try {
    const pointsAwarded = Math.floor(Math.random() * 10) + 1;
    const user = await User.findById(req.body.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user points
    user.points += pointsAwarded;
    await user.save();

    // Create point history record
    await PointHistory.create({
      userId: user._id,
      pointsAwarded
    });

    res.json({ pointsAwarded, totalPoints: user.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game history
app.get('/point-history', async (req, res) => {
  try {
    const history = await PointHistory.find()
      .populate('userId', 'username')
      .sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server initialization
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
