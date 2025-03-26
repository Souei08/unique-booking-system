export const bookings = [
  {
    id: 1,
    title: "City Walking Tour",
    service: "Guided Tour",
    customer: {
      name: "Sarah Johnson",
      handle: "sarahj",
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    staff: [
      {
        name: "Maria Garcia",
        handle: "mariag",
        imageUrl:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
    duration: "120 min",
    time: "10:00 AM",
    date: "March 20, 2024",
    status: "Confirmed",
    price: "$45.00",
    featured: true,
    bgColorClass: "bg-green-600",
    startTime: "2024-03-20T10:00:00",
    endTime: "2024-03-20T12:00:00",
  },
  // ... other booking entries ...
];
