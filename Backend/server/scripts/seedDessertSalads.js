require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/berryrecipes';

const sampleRecipes = [
  {
    title: 'Strawberry Lemon Dessert Salad',
    description: 'Fresh strawberries, lemon zest, and a hint of mint tossed with honey-yogurt dressing — light, bright, and perfect for summer.',
    images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200&h=900&fit=crop'],
    ingredients: ['2 cups strawberries, hulled and sliced', '1 cup greek yogurt', '2 tsp honey', 'zest of 1 lemon', 'fresh mint leaves'],
    steps: ['Combine yogurt, honey and lemon zest in a bowl', 'Toss strawberries with yogurt mixture', 'Garnish with mint and serve chilled'],
    category: 'Dessert',
    likesCount: 240,
    viewCount: 1820,
  },
  {
    title: 'Mango Coconut Dessert Salad',
    description: 'Ripe mango cubes, toasted coconut flakes, and lime juice with a creamy coconut yogurt drizzle — tropical and refreshing.',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=900&fit=crop'],
    ingredients: ['2 ripe mangoes, diced', '1/4 cup toasted coconut flakes', '1/2 cup coconut yogurt', '1 tbsp lime juice'],
    steps: ['Toss mango with lime juice', 'Fold in coconut yogurt and top with toasted coconut'],
    category: 'Dessert',
    likesCount: 312,
    viewCount: 2140,
  },
  {
    title: 'Chocolate Berry Dessert Salad',
    description: 'Mixed berries folded into whipped chocolate cream with a sprinkle of cacao nibs — decadent yet fruity.',
    images: ['https://images.unsplash.com/photo-1521305916504-4a1121188589?w=1200&h=900&fit=crop'],
    ingredients: ['1 cup mixed berries', '1/2 cup heavy cream', '2 tbsp cocoa powder', '1 tbsp sugar', 'cacao nibs for garnish'],
    steps: ['Whip cream with cocoa powder and sugar', 'Fold in berries gently', 'Top with cacao nibs and serve'],
    category: 'Dessert',
    likesCount: 290,
    viewCount: 1950,
  },
  {
    title: 'Caramel Apple Dessert Salad',
    description: 'Crisp apple slices, candied walnuts, and caramel mascarpone make for a cozy dessert salad with crunch.',
    images: ['https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1200&h=900&fit=crop'],
    ingredients: ['2 apples, thinly sliced', '1/2 cup mascarpone', '2 tbsp caramel sauce', '1/4 cup candied walnuts'],
    steps: ['Whisk mascarpone with caramel until smooth', 'Toss apples with mascarpone mixture', 'Top with candied walnuts and serve'],
    category: 'Dessert',
    likesCount: 210,
    viewCount: 1680,
  },
  {
    title: 'Tropical Pineapple Dessert Salad',
    description: 'Grilled pineapple, toasted macadamia, and a lime-honey glaze — a sweet and smoky dessert bowl.',
    images: ['https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1200&q=80'],
    ingredients: ['1 pineapple, sliced and grilled', '1/4 cup toasted macadamia nuts', '1 tbsp honey', '1 tbsp lime juice'],
    steps: ['Grill pineapple slices until caramelized', 'Whisk honey with lime juice and drizzle over pineapple', 'Sprinkle macadamia and serve warm or chilled'],
    category: 'Dessert',
    likesCount: 376,
    viewCount: 2270,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Ensure a system user exists
    let systemUser = await User.findOne({ email: 'system@berry.local' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System User',
        email: 'system@berry.local',
        password: 'changeme123',
        bio: 'Auto-created user for seeded recipes',
      });
      console.log('Created system user:', systemUser._id.toString());
    } else {
      console.log('Found existing system user:', systemUser._id.toString());
    }

    // Remove any existing seeded dessert-salad recipes to avoid duplicates
    const titles = sampleRecipes.map(r => r.title);
    const removed = await Recipe.deleteMany({ title: { $in: titles } });
    if (removed.deletedCount) console.log(`Removed ${removed.deletedCount} existing seeded recipes`);

    // Insert recipes with owner set to system user
    const toInsert = sampleRecipes.map(r => ({ ...r, owner: systemUser._id }));
    const inserted = await Recipe.insertMany(toInsert);
    console.log(`Inserted ${inserted.length} recipes`);

    await mongoose.disconnect();
    console.log('Disconnected and finished seeding.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
