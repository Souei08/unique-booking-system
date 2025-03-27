export interface Tour {
  id: string;
  title: string;
  description: string;
  duration: number;
  group_size: number;
  slots: number;
  schedule: string[];
  rate: number;
  experience_level: "beginner" | "advanced" | "all";
  cantering_allowed: boolean;
  weight_limit: number;
  min_age: number;
  location: string;
  includes: string[];
  booking_link: string;
  created_at: string;
}

export type CreateTourDTO = Omit<Tour, "id" | "created_at">;
export type UpdateTourDTO = Partial<CreateTourDTO>;
