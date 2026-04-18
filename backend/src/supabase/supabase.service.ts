import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private adminClient: SupabaseClient;
  private publicClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    this.adminClient = createClient(supabaseUrl!, serviceRoleKey!);
    this.publicClient = createClient(supabaseUrl!, anonKey!);
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  getPublicClient(): SupabaseClient {
    return this.publicClient;
  }
}
