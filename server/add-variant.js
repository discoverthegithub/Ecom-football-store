import mongoose from 'mongoose';
import ProductVariant from './src/modules/products/productVariant.model.js';
import Product from './src/modules/products/product.model.js';

mongoose.connect('mongodb://localhost:27017/mt-ecommerce').then(async () => {
  const product = await Product.findOne();
  if (product) {
    const existing = await ProductVariant.findOne({ product: product._id });
    if(!existing) {
        await ProductVariant.create({
            product: product._id,
            sku: 'TEST-SKU-1',
            price: 29.99,
            stock: 100,
            size: 'M',
            color: { name: 'Black' }
        });
        console.log('Variant created for product', product._id);
    } else {
        console.log('Variant already exists');
    }
  }
  process.exit(0);
}).catch(console.error);
