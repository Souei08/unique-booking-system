import { BaseService } from "../base";
import { Tour, CreateTourDTO, UpdateTourDTO } from "../../_lib/types/tours";

export class ToursService extends BaseService<Tour> {
  constructor() {
    super("tours");
  }

  async create(data: CreateTourDTO) {
    const supabase = await this.getClient();
    const { data: tour, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating tour:", error);
      throw new Error("Failed to create tour");
    }

    return tour as Tour;
  }

  async update(id: string, data: UpdateTourDTO) {
    const supabase = await this.getClient();
    const { data: tour, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating tour:", error);
      throw new Error("Failed to update tour");
    }

    return tour as Tour;
  }

  async delete(id: string) {
    const supabase = await this.getClient();
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) {
      console.error("Error deleting tour:", error);
      throw new Error("Failed to delete tour");
    }
  }
}

export const toursService = new ToursService();
