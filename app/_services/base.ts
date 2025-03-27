import { createClient } from "@/supabase/server";

export class BaseService<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async getClient() {
    return await createClient();
  }

  async findAll(options?: {
    orderBy?: keyof T;
    ascending?: boolean;
    limit?: number;
  }) {
    const supabase = await this.getClient();
    let query = supabase.from(this.tableName).select("*");

    if (options?.orderBy) {
      query = query.order(options.orderBy as string, {
        ascending: options.ascending ?? false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw new Error(`Failed to fetch ${this.tableName}`);
    }

    return data as T[];
  }

  async findById(id: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw new Error(`Failed to fetch ${this.tableName}`);
    }

    return data as T;
  }
}
