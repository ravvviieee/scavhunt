import { storage } from './storage';
import * as bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await storage.createUser({
      username: 'admin',
      password: hashedPassword,
      isAdmin: true
    });
    
    console.log('Admin user created successfully:', { 
      username: adminUser.username, 
      isAdmin: adminUser.isAdmin 
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();