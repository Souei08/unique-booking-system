import React from "react";

interface IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  label,
  className = "text-strong hover:bg-brand hover:text-white hover:border-brand border-strong",
}) => {
  return (
    <button
      type="button"
      className={`mr-2 border text-small font-regular rounded-md px-2 py-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="sr-only">{label}</span>
        {label}
      </div>
    </button>
  );
};

export default IconButton;
