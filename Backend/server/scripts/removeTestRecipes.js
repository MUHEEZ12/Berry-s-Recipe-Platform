require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/berryrecipes';

async function run() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const testPattern = /\b(test|ci|automated testing|created by ci)\b|recipe\s*\d{5,}/i;

    const matches = await Recipe.find({
      $or: [
        { title: { $regex: testPattern } },
        { description: { $regex: testPattern } }
      ]
    }).select('title description');

    if (!matches || matches.length === 0) {
      console.log('No test/CI recipes found.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${matches.length} recipes to remove:`);
    matches.forEach(r => console.log(` - (${r._id}) ${r.title}`));

    const ids = matches.map(r => r._id);
    const res = await Recipe.deleteMany({ _id: { $in: ids } });
    console.log(`Deleted ${res.deletedCount} recipes.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during removal:', err);
    process.exit(1);
  }
}

run();
