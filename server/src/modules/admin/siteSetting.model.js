import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'Premium Store',
  },
  supportEmail: {
    type: String,
    required: true,
    default: 'support@example.com',
  },
  contactPhone: {
    type: String,
    default: '',
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  taxRate: {
    type: Number,
    default: 0.08,
  },
  freeShippingThreshold: {
    type: Number,
    default: 100,
  },
  standardShippingRate: {
    type: Number,
    default: 15,
  }
}, { timestamps: true });

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);
export default SiteSetting;
