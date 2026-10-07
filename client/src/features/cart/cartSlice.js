import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const response = await cartService.getCart();
      return response.data; // adjust based on actual structure
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, thunkAPI) => {
    try {
      const response = await cartService.addItem(itemData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      const response = await cartService.updateItemQuantity(itemId, quantity);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, thunkAPI) => {
    try {
      const response = await cartService.removeItem(itemId);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const syncLocalCart = createAsyncThunk(
  'cart/syncLocalCart',
  async (_, thunkAPI) => {
    try {
      const localCart = loadLocalCart();
      if (localCart.items && localCart.items.length > 0) {
        for (const item of localCart.items) {
          const productId = item.product?._id || item.product;
          const variantId = item.variantId || item.variant?._id || null;
          await cartService.addItem({ productId, variantId, quantity: item.quantity || 1 });
        }
        localStorage.removeItem('localCart');
      }
      const response = await cartService.getCart();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to sync local cart');
    }
  }
);

// Fallback for unauthenticated users
const loadLocalCart = () => {
  try {
    const serializedState = localStorage.getItem('localCart');
    if (serializedState === null) {
      return { items: [], subtotal: 0, total: 0 };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return { items: [], subtotal: 0, total: 0 };
  }
};

const saveLocalCart = (state) => {
  try {
    const serializedState = JSON.stringify({
      items: state.items,
      subtotal: state.subtotal,
      total: state.total
    });
    localStorage.setItem('localCart', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const initialState = {
  ...loadLocalCart(),
  isDrawerOpen: false,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    // For unauthenticated users (local state management)
    addLocalItem: (state, action) => {
      const newItem = action.payload; // expecting product details
      const existingItem = state.items.find(item => item.product._id === newItem.product._id);
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      
      // Recalculate totals
      state.subtotal = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      state.total = state.subtotal;
      saveLocalCart(state);
      state.isDrawerOpen = true; // Auto open drawer on add for guests
    },
    removeLocalItem: (state, action) => {
      const itemId = action.payload; // this would be product._id for local cart
      state.items = state.items.filter(item => item.product._id !== itemId);
      state.subtotal = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      state.total = state.subtotal;
      saveLocalCart(state);
    },
    updateLocalItem: (state, action) => {
      const { itemId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product._id === itemId);
      if (existingItem) {
        existingItem.quantity = quantity;
        state.subtotal = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        state.total = state.subtotal;
        saveLocalCart(state);
      }
    },
    clearLocalCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.total = 0;
      localStorage.removeItem('localCart');
    }
  },
  extraReducers: (builder) => {
    const extractCartData = (payload) => {
      const cart = payload?.data || payload?.cart || payload || {};
      return {
        items: cart.items || [],
        subtotal: cart.subtotal !== undefined ? cart.subtotal : (cart.subTotal || 0),
        total: cart.total || 0,
      };
    };

    // Handle async thunks (Authenticated flow)
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = extractCartData(action.payload);
        state.items = cart.items;
        state.subtotal = cart.subtotal;
        state.total = cart.total;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => { state.isLoading = true; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = extractCartData(action.payload);
        state.items = cart.items;
        state.subtotal = cart.subtotal;
        state.total = cart.total;
        state.isDrawerOpen = true; // Auto open drawer on add
      })
      
      // Update Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const cart = extractCartData(action.payload);
        state.items = cart.items;
        state.subtotal = cart.subtotal;
        state.total = cart.total;
      })
      
      // Remove Item
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const cart = extractCartData(action.payload);
        state.items = cart.items;
        state.subtotal = cart.subtotal;
        state.total = cart.total;
      })
      
      // Sync Local Cart
      .addCase(syncLocalCart.fulfilled, (state, action) => {
        const cart = extractCartData(action.payload);
        state.items = cart.items;
        state.subtotal = cart.subtotal;
        state.total = cart.total;
      });
  },
});

export const { 
  toggleDrawer, closeDrawer, addLocalItem, removeLocalItem, updateLocalItem, clearLocalCart 
} = cartSlice.actions;
export default cartSlice.reducer;
