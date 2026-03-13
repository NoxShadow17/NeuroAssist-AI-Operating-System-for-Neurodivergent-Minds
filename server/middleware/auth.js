import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('❌ Auth failed: Missing or invalid header');
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('🔐 Validating token with Supabase...');
    console.log('Using SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗ NOT SET');
    console.log('Using SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓' : '✗ NOT SET');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.warn('❌ Auth error:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }

    if (!user) {
      console.warn('❌ No user found for token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log('✓ Auth successful for user:', user.id);
    req.user = user;
    req.supabase = supabase;
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message);
    return res.status(500).json({ error: 'Authentication error', details: err.message });
  }
};

export default authMiddleware;
