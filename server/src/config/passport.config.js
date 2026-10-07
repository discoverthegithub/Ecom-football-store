/**
 * Passport Configuration — Google OAuth 2.0
 * -------------------------------------------
 * Configures Google OAuth strategy for social login.
 * Creates a new user if first-time login, or finds existing user by googleId.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from './env.config.js';
import User from '../modules/users/user.model.js';
import logger from '../utils/logger.js';
import { USER_ROLES } from '../utils/constants.js';

const configurePassport = () => {
  // Only configure if Google OAuth credentials are provided
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    logger.warn('⚠️  Google OAuth not configured. Skipping Passport setup.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Existing Google user — update last login
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          // Check if user exists with the same email (registered via email/password)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isVerified = true; // Google accounts are pre-verified
            user.lastLogin = new Date();

            if (!user.avatar.url && profile.photos[0]?.value) {
              user.avatar = {
                public_id: '',
                url: profile.photos[0].value,
              };
            }

            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          // Create a new user from Google profile
          const newUser = await User.create({
            firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true,
            role: USER_ROLES.CUSTOMER,
            avatar: {
              public_id: '',
              url: profile.photos[0]?.value || '',
            },
            lastLogin: new Date(),
          });

          return done(null, newUser);
        } catch (error) {
          logger.error(`❌ Google OAuth error: ${error.message}`);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user ID into session (not used with JWT, but required by Passport)
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  logger.info('✅ Google OAuth strategy configured');
};

export default configurePassport;
