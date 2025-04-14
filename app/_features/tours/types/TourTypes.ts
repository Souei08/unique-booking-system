export interface Tour {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  group_size_limit: number;
  rate: number;
  slots: number;
  meeting_point_address: string;
  dropoff_point_address: string;
  languages: string[];
  trip_highlights: string[];
  things_to_know: string;
  includes: string[];
  faq: string[];
  created_at: string;
}

export type CreateTourDTO = Omit<Tour, "id" | "created_at">;
export type UpdateTourDTO = Partial<CreateTourDTO>;
