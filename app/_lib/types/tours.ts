export interface Tour {
  id: string;
  title: string;
  description: string;
  duration: number;
  group_size_limit: number;
  slots: number;
  rate: number;
  experience_level: "beginner" | "advanced" | "all";
  weight_limit: number;
  location: string;
  includes: string[];
  booking_link: string;
  category: string;
  created_at: string;
}

export type CreateTourDTO = Omit<Tour, "id" | "created_at">;
export type UpdateTourDTO = Partial<CreateTourDTO>;
