export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  color?: string;
  status?: "pending" | "completed" | "cancelled";
  max_slots?: number;
  tour_id?: string;
}

export interface EventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    event: CalendarEvent,
    status: CalendarEvent["status"]
  ) => void;
}
