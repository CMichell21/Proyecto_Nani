import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async getUsers() {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('usuario')
      .select('*');

    return { data, error };
  }
}