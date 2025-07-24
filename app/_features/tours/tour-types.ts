export interface FAQ {
  question: string;
  answer: string;
}

export interface CustomSlotField {
  name: string;
  type: "text" | "number" | "select" | "checkbox";
  required: boolean;
  options?: string[];
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface TourLocalImage {
  file?: File;
  url: string;
  isFeature: boolean;
  uploaded?: boolean;
}

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
  // things_to_know: string;
  includes: string[];
  faq: string[]; // Array of JSON strings containing FAQ objects
  images: string; // Array of tour images with metadata
  created_at: string;
  custom_slot_types: string | null; // JSON string containing custom slot types
  custom_slot_fields: string | null; // JSON string containing custom slot fields
  waiver_link?: string;
  status?: string; // Tour status: active, inactive, draft, etc.
}

export type CreateTourDTO = Omit<Tour, "id" | "created_at" | "images"> & {
  faq?: string[]; // Make faq optional
  custom_slot_types?: string | null; // Make custom_slot_types optional
  custom_slot_fields?: string | null; // Make custom_slot_fields optional
  waiver_link?: string;
};

export type UpdateTourDTO = Partial<CreateTourDTO>;
