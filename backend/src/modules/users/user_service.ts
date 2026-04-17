import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';

export class UserService {
  async get_all_users() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, createdAt');

    if (error) throw new Error(error.message);
    return data;
  }

  async get_user_by_id(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async create_user(data: { name: string; email: string; phone?: string; password?: string; role?: any }) {
    let hashed_password = null;
    
    if (data.password) {
      hashed_password = await bcrypt.hash(data.password, 10);
    }

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
      if (error.code === '23505') throw new Error('อีเมลนี้มีในระบบแล้ว');
      throw new Error(error.message);
    }
    return newUser;
  }

  async update_user(id: string, data: any) {
    let updateData = { ...data };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedUser;
  }

  async delete_user(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}