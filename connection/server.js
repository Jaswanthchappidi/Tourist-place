// server.js

// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- INITIALIZATIONS ---
const app = express();
const PORT = process.env.PORT || 5002;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

const dbURI = "mongodb+srv://Jaswanth:cHAt0TOziFfJLpM0@touristappproject.roc687a.mongodb.net/?retryWrites=true&w=majority&appName=TouristAppProject";

console.log("Attempting to connect to MongoDB...");

mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));
const placeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } 
    }
});
placeSchema.index({ location: '2dsphere' });

const Place = mongoose.model('Place', placeSchema);


// --- API ROUTES (No changes below this line) ---

/**
 * @route   GET /api/places/search
 * @desc    Search for a place by its name (case-insensitive)
 * @access  Public
 */
app.get('/api/places/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ msg: 'Search query is required.' });
        }
        const place = await Place.findOne({ name: query.toLowerCase() });
        if (!place) {
            return res.status(404).json({ msg: `No tourist spots found for "${query}". Please try another location.` });
        }
        res.json(place);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/places
 * @desc    Add a new tourist place to the database
 * @access  Public (or protected in a real app)
 */
app.post('/api/places', async (req, res) => {
    try {
        const { name, description, imageUrl, longitude, latitude } = req.body;
        if (!name || !description || !imageUrl || !longitude || !latitude) {
            return res.status(400).json({ msg: 'Please provide all fields: name, description, imageUrl, longitude, latitude.' });
        }
        const newPlace = new Place({
            name,
            description,
            imageUrl,
            location: { coordinates: [longitude, latitude] }
        });
        const savedPlace = await newPlace.save();
        res.status(201).json(savedPlace);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ msg: `A place named "${req.body.name}" already exists.` });
        }
        console.error("Add Place Error:", error);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// --- DATABASE SEEDING ---
async function seedDatabase() {
    try {
        const count = await Place.countDocuments();
        if (count > 0) {
            console.log("Database already has data. Seeding not required.");
            return;
        }
        console.log("No data found. Seeding database with initial places...");
        const initialPlaces = [
            {
                name: 'agra',
                description: 'Famous for the Taj Mahal, a monument of love.',
                imageUrl: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg',
                location: { coordinates: [78.0422, 27.1751] }
            },
            {
                name: 'jaipur',
                description: 'The Pink City, known for its stunning forts and palaces.',
                imageUrl: 'https://images.pexels.com/photos/3569950/pexels-photo-3569950.jpeg',
                location: { coordinates: [75.7873, 26.9124] }
            },
            {
                name: 'goa',
                description: 'A coastal paradise famous for its beautiful beaches and vibrant nightlife.',
                imageUrl: 'https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg',
                location: { coordinates: [73.8278, 15.2993] }
            },
        ];
        await Place.insertMany(initialPlaces);
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Tourist places server is running on http://localhost:${PORT}`);
});
