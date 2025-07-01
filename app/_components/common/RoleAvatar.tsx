"use client";

interface RoleAvatarProps {
  full_name: string;
  className?: string;
}

export const RoleAvatar = ({
  full_name,
  className = "w-12 h-12",
}: RoleAvatarProps) => {
  // Generate initials from full_name
  const getInitials = () => {
    return full_name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials();

  // Generate a consistent color based on the name
  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getColorFromName(full_name);

  return (
    <div
      className={`${className} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
    >
      {initials}
    </div>
  );
};
