import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from "react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & RefAttributes<SVGSVGElement>
  >;
}

export interface Service {
  name: string;
  href: string;
  bgColorClass: string;
}

export interface Staff {
  name: string;
  handle: string;
  imageUrl: string;
}

export interface Customer {
  name: string;
  handle: string;
  imageUrl: string;
}

export interface Booking {
  id: number;
  title: string;
  time: string;
  service: string;
  customer: Customer;
  staff: Staff[];
  duration: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  price: string;
  featured: boolean;
  bgColorClass: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  services: Service[];
}
