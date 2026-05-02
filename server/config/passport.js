const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User           = require('../models/User');

const CALLBACK_BASE = process.env.OAUTH_CALLBACK_BASE || 'http://localhost:5000';

function makeUsername(raw) {
  return (raw || '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 30) || `user${Date.now()}`;
}

async function findOrCreateOAuthUser({ provider, providerId, email, displayName, avatar }) {
  // 1. Exact match by provider + id
  let user = await User.findOne({ provider, providerId });
  if (user) return user;

  // 2. Same email already registered — link the OAuth provider to it
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user.provider   = provider;
      user.providerId = providerId;
      user.avatar     = user.avatar || avatar;
      await user.save({ validateBeforeSave: false });
      return user;
    }
  }

  // 3. Brand-new user
  return User.create({
    email:      email || `${providerId}@${provider}.noemail`,
    username:   makeUsername(displayName),
    provider,
    providerId,
    avatar,
  });
}

// ── Google ────────────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  `${CALLBACK_BASE}/api/auth/google/callback`,
      },
      async (_at, _rt, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider:    'google',
            providerId:  profile.id,
            email:       profile.emails?.[0]?.value,
            displayName: profile.displayName,
            avatar:      profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
}

// ── GitHub ────────────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID:     process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:  `${CALLBACK_BASE}/api/auth/github/callback`,
        scope:        ['user:email'],
      },
      async (_at, _rt, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider:    'github',
            providerId:  String(profile.id),
            email:       profile.emails?.[0]?.value,
            displayName: profile.username || profile.displayName,
            avatar:      profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
