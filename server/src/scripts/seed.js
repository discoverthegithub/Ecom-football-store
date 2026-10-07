import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

import Category from '../modules/categories/category.model.js';
import Product from '../modules/products/product.model.js';
import ProductVariant from '../modules/products/productVariant.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env.development') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mt-ecommerce');
    console.log('MongoDB Connected successfully for False Nine seeding');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const generateSKU = (productName, color, size) => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const clr = color.substring(0, 3).toUpperCase();
  const sz = size.toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${clr}-${sz}-${random}`;
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing product data...');
    await ProductVariant.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    console.log('Seeding False Nine categories...');
    const catClubs = await Category.create({ name: 'Clubs', description: 'Official Football Club Shirts', isActive: true, sortOrder: 1 });
    const catNations = await Category.create({ name: 'Nations', description: 'National Team World Cup Kits', isActive: true, sortOrder: 2 });
    const catVintage = await Category.create({ name: 'Vintage Vault', description: 'Rare Retro & Legendary Football Shirts', isActive: true, sortOrder: 3 });

    console.log('Seeding authentic football kits for False Nine...');
    const productsData = [
      {
        name: 'Manchester City 23/24 Home Kit',
        description: 'Authentic 2023/2024 Sky Blue Home Kit celebrating 20 years at the Etihad Stadium. Engineered with ULTRAWEAVE technology.',
        shortDescription: 'Man City 23/24 Home Shirt - HAALAND #9',
        price: 120.00,
        comparePrice: 145.00,
        category: catClubs._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: true,
        team: 'Manchester City',
        league_or_type: 'Club',
        league: 'Premier League',
        season: '23/24',
        isVintage: false,
        stock_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop', public_id: 'mancity_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop', public_id: 'mancity_back', isPrimary: false }
        ]
      },
      {
        name: 'Manchester United 1998/99 Treble Vintage Kit',
        description: 'Iconic 1998/99 Treble Winner Home Kit. Featuring the legendary zip collar and Sharp sponsor emblem as worn in Barcelona 1999.',
        shortDescription: 'Man Utd 98/99 Vintage Kit - BECKHAM #7',
        price: 185.00,
        comparePrice: 220.00,
        category: catVintage._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: true,
        team: 'Manchester United',
        league_or_type: 'Club',
        league: 'Premier League',
        season: '1998 Vintage',
        isVintage: true,
        stock_sizes: ['S', 'M', 'L', 'XL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop', public_id: 'manutd_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop', public_id: 'manutd_back', isPrimary: false }
        ]
      },
      {
        name: 'Real Madrid 23/24 Home Kit',
        description: 'Clean White & Gold 2023/24 Home Kit. Royal gold trim detailing on sleeve cuffs with "Hala Madrid!" woven inside the collar.',
        shortDescription: 'Real Madrid 23/24 Kit - BELLINGHAM #5',
        price: 130.00,
        comparePrice: 150.00,
        category: catClubs._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: true,
        team: 'Real Madrid',
        league_or_type: 'Club',
        league: 'La Liga',
        season: '23/24',
        isVintage: false,
        stock_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop', public_id: 'rm_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop', public_id: 'rm_back', isPrimary: false }
        ]
      },
      {
        name: 'FC Barcelona 1998/99 Centenary Vintage Kit',
        description: 'Legendary Centenary 1899-1999 Split Blaugrana Kit with golden 100 Years emblem. Worn by Rivaldo and Pep Guardiola.',
        shortDescription: 'Barca 98/99 Centenary - RIVALDO #10',
        price: 195.00,
        comparePrice: 240.00,
        category: catVintage._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: true,
        team: 'FC Barcelona',
        league_or_type: 'Club',
        league: 'La Liga',
        season: '1998 Vintage',
        isVintage: true,
        stock_sizes: ['M', 'L', 'XL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop', public_id: 'barca_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop', public_id: 'barca_back', isPrimary: false }
        ]
      },
      {
        name: 'Argentina 2022 World Cup Winner Kit',
        description: '3-Star World Champion Edition Albiceleste Home Kit with official FIFA World Champions Gold Badge on the chest.',
        shortDescription: 'Argentina 3-Star Kit - MESSI #10',
        price: 150.00,
        comparePrice: 180.00,
        category: catNations._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: true,
        team: 'Argentina',
        league_or_type: 'Nation',
        league: 'International',
        season: '2022 World Cup',
        isVintage: false,
        stock_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop', public_id: 'arg_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop', public_id: 'arg_back', isPrimary: false }
        ]
      },
      {
        name: 'Brazil 2002 Vintage World Cup Kit',
        description: 'The iconic 5th Star World Cup winning jersey. Worn by Ronaldo Nazário (El Fenómeno) during his historic 8-goal tournament in Korea/Japan.',
        shortDescription: 'Brazil 2002 Vintage Kit - RONALDO #9',
        price: 210.00,
        comparePrice: 250.00,
        category: catVintage._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: true,
        team: 'Brazil',
        league_or_type: 'Nation',
        league: 'International',
        season: '2002 Vintage',
        isVintage: true,
        stock_sizes: ['S', 'M', 'L', 'XL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop', public_id: 'bra_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop', public_id: 'bra_back', isPrimary: false }
        ]
      },
      {
        name: 'Arsenal 2003/04 Invincibles Vintage Kit',
        description: 'The legendary unbeaten 38-game Premier League season kit. Classic O2 sponsor logo and gold O2 detailing.',
        shortDescription: 'Arsenal 03/04 Invincibles - HENRY #14',
        price: 175.00,
        comparePrice: 210.00,
        category: catVintage._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: false,
        isBestSeller: true,
        team: 'Arsenal',
        league_or_type: 'Club',
        league: 'Premier League',
        season: '2003 Vintage',
        isVintage: true,
        stock_sizes: ['M', 'L', 'XL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=800&auto=format&fit=crop', public_id: 'ars_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop', public_id: 'ars_back', isPrimary: false }
        ]
      },
      {
        name: 'France 2022 World Cup Home Kit',
        description: 'Midnight Blue and Gold Les Bleus jersey featuring subtle oak leaf pattern and metallic gold FFF crest.',
        shortDescription: 'France 2022 Home Kit - MBAPPÉ #10',
        price: 135.00,
        comparePrice: 160.00,
        category: catNations._id,
        gender: 'unisex',
        status: 'active',
        isFeatured: true,
        isBestSeller: false,
        team: 'France',
        league_or_type: 'Nation',
        league: 'International',
        season: '2022 World Cup',
        isVintage: false,
        stock_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        kitImages: {
          front: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
          back: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
          detail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop', public_id: 'fra_front', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop', public_id: 'fra_back', isPrimary: false }
        ]
      }
    ];

    for (const p of productsData) {
      const createdProduct = await Product.create(p);
      
      // Create stock variants per size
      for (const size of p.stock_sizes) {
        await ProductVariant.create({
          product: createdProduct._id,
          sku: generateSKU(p.name, 'Default', size),
          size,
          color: { name: 'Official Edition', hexCode: '#C5A059' },
          price: p.price,
          comparePrice: p.comparePrice,
          stock: 15,
          isActive: true
        });
      }
    }

    console.log('False Nine Database seeded successfully with 8 premium authentic kits!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
