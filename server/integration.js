

import mongoose from 'mongoose';
async function doFetch(path, options = {}) {
  const url = 'http://localhost:5000/api/v1' + path;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  try {
    // 1. Register & Login
    console.log('--- Testing Auth ---');
    const email = 'test' + Date.now() + '@example.com';
    await doFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'Test', lastName: 'User', email, password: 'Password123!', confirmPassword: 'Password123!' })
    });
    
    // Verify user manually in DB so login works
    await mongoose.connect('mongodb://localhost:27017/mt-ecommerce');
    await mongoose.connection.collection('users').updateOne({email}, {$set: {isVerified:true}});
    
    const loginRes = await doFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    console.log('Login:', loginRes.data.success ? 'OK' : loginRes.data.message);
    const token = loginRes.data.data.accessToken;

    const authHeaders = { 'Authorization': 'Bearer ' + token };

    // 2. Get Products
    console.log('--- Testing Products ---');
    const productsRes = await doFetch('/products', { method: 'GET' });
    console.log('Products:', productsRes.data.success ? 'OK (' + productsRes.data.data.products.length + ' found)' : productsRes.data.message);
    
    if(productsRes.data.data.products.length === 0) {
      console.log('No products found, skipping cart test.');
      return;
    }
    
    const productId = productsRes.data.data.products[0]._id;

    // 3. Add to Cart
    console.log('--- Testing Cart ---');
    // Find variant id if it exists
    const variants = productsRes.data.data.products[0].variants || [];
    const variantId = variants.length > 0 ? variants[0]._id : productId;
    const cartRes = await doFetch('/cart/items', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ product: productId, variant: variantId || productId, quantity: 1 })
    });
    console.log('Add to Cart:', cartRes.status, cartRes.data);

    // 4. Get Cart
    const getCartRes = await doFetch('/cart', { method: 'GET', headers: authHeaders });
    console.log('Get Cart:', getCartRes.data.success ? 'OK' : getCartRes.data.message);

    // 5. Add to Wishlist
    console.log('--- Testing Wishlist ---');
    const wishlistRes = await doFetch('/wishlist/toggle', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ product: productId })
    });
    console.log('Add to Wishlist:', wishlistRes.data.success ? 'OK' : JSON.stringify(wishlistRes.data.errors));

    // 6. Get Profile
    console.log('--- Testing Profile ---');
    const profileRes = await doFetch('/auth/me', { method: 'GET', headers: authHeaders });
    console.log('Get Profile:', profileRes.data.success ? 'OK' : profileRes.data.message);

    // 7. Test Orders
    console.log('--- Testing Orders ---');
    // First need an address to create an order
    const addressRes = await doFetch('/users/addresses', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'shipping',
        fullName: 'Test User',
        street: '123 Test St',
        city: 'Testville',
        state: 'TS',
        country: 'Testland',
        zipCode: '12345',
        phone: '1234567890',
        isDefault: true
      })
    });
    console.log('Create Address:', addressRes.data.success ? 'OK' : JSON.stringify(addressRes.data.errors || addressRes.data.message));
    
    const addressId = addressRes.data.data ? addressRes.data.data._id : undefined;

    // Create Order
    if (addressId) {
      const orderRes = await doFetch('/orders', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          shippingAddress: addressId,
          paymentMethod: 'cod'
        })
      });
      console.log('Create Order:', orderRes.data.success ? 'OK' : JSON.stringify(orderRes.data.errors || orderRes.data.message));
    }
    
    const getOrdersRes = await doFetch('/orders/my-orders', { method: 'GET', headers: authHeaders });
    console.log('Get Orders:', getOrdersRes.data.success ? 'OK' : getOrdersRes.data.message);
    
  } catch(e) {
    console.error('Test error:', e);
  } finally {
    console.log('--- Tests Complete ---');
    process.exit(0);
  }
}

runTests();
