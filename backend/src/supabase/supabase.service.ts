import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private adminClient: SupabaseClient;
  private publicClient: SupabaseClient;

  constructor() {
    this.adminClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    this.publicClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  getPublicClient(): SupabaseClient {
    return this.publicClient;
  }
}