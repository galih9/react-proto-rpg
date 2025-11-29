import React from 'react';

interface Props {
  current: number;
  max: number;
  width?: string; // Tailwind width class or px value
}

export const HealthBar: React.FC<Props> = ({ current, max, width = "w-16" }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  // Color logic
  let colorClass = "bg-green-500";
  if (percentage < 50) colorClass = "bg-yellow-500";
  if (percentage < 25) colorClass = "bg-red-500";

  return (
    <div className={`h-2 bg-gray-300 rounded overflow-hidden border border-gray-400 ${width}`}>
      <div
        className={`h-full ${colorClass} transition-all duration-300 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
