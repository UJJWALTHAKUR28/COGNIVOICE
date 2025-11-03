import React from "react";

interface PulseMicIconProps {
  className?: string;
}

const PulseMicIcon: React.FC<PulseMicIconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="9" y="2" width="6" height="11" rx="3" ry="3" />
    <line x1="12" y1="13" x2="12" y2="17" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <polyline points="9 8 10.5 8 11 10 12 6 13 14 14 10 15 10" />
  </svg>
);

export default PulseMicIcon;
