import { supabase } from '../../config/supabase';

export class SavedPlaceService {
  async getSavedPlaces(userId: string) {
    const { data, error } = await supabase
      .from('SavedPlace')
      .select('placeId')
      .eq('userId', userId);
      
    if (error) throw new Error(error.message);
    return data.map(item => item.placeId);
  }

  async toggleSavePlace(userId: string, placeId: string) {
    const { data: existing, error: checkError } = await supabase
      .from('SavedPlace')
      .select('id')
      .eq('userId', userId)
      .eq('placeId', placeId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(checkError.message);
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from('SavedPlace')
        .delete()
        .eq('id', existing.id);
      if (deleteError) throw new Error(deleteError.message);
      return { action: 'removed' };
    } else {
      const { error: insertError } = await supabase
        .from('SavedPlace')
        .insert([{ userId, placeId }]);
      if (insertError) throw new Error(insertError.message);
      return { action: 'added' };
    }
  }
}