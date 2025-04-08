export interface Tour {
  id: string;
  title: string;
  description: string;
  duration: number;
  group_size: number;
  slots: number;
  rate: number;
  experience_level: "beginner" | "advanced" | "all";
  weight_limit: number;
  location: string;
  includes: string[];
  booking_link: string;
  created_at: string;
  category: string;
}

export type CreateTourDTO = Omit<Tour, "id" | "created_at">;
export type UpdateTourDTO = Partial<CreateTourDTO>;
