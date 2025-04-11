import { Tour } from "@/app/_api/actions/types";
import { BookingFormData } from "./schema";

export interface BookingFormProps {
  onSubmit: () => void;
}

export interface StepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  trigger: any;
  selectedTour: Tour | null;
  tours: Tour[];
  schedules: any[];
  isLoadingSchedules: boolean;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  condition: boolean;
  children: null;
}
