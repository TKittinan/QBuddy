import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';

export class AuthService {
  async register(data: any) {
    const hashed_password = await bcrypt.hash(data.password, 10);
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashed_password,
        role: data.role || 'CUSTOMER',
        status: 'INACTIVE'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Email already exists');
      throw new Error(error.message);
    }

    return newUser;
  }

  async login(data: any) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    if (error || !user || !user.password) {
      throw new Error('Email or password incorrect');
    }

    const is_match = await bcrypt.compare(data.password, user.password);
    if (!is_match) {
      throw new Error('Email or password incorrect');
    }
    const { error: updateError } = await supabase
      .from('users')
      .update({ status: 'ACTIVE' })
      .eq('id', user.id);

    if (updateError) {
      console.error("Failed to update user status:", updateError);
    }
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      ENV.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    const { password, ...userWithoutPassword } = user;
    
    userWithoutPassword.status = 'ACTIVE';

    return { user: userWithoutPassword, token };
  }
}