import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className }) => {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
};

export { Badge };
