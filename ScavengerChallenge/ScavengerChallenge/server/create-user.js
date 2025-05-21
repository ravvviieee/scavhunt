const bcrypt = require('bcrypt');
const { Pool } = require('@neondatabase/serverless');

// Connect to the database
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function createUser() {
  try {
    // Admin user details
    const username = 'admin';
    const password = 'admin123';
    const isAdmin = true;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('User already exists. Updating to admin...');
      
      // Update user to admin
      await pool.query(
        'UPDATE users SET is_admin = $1 WHERE username = $2',
        [isAdmin, username]
      );
      
      console.log('User updated to admin successfully');
    } else {
      // Insert new admin user
      await pool.query(
        'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)',
        [username, hashedPassword, isAdmin]
      );
      
      console.log('Admin user created successfully');
    }
    
    console.log('Login with these credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('Error creating/updating user:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

createUser();