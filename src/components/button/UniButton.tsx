import type { FC, ReactNode } from 'react';
import React from 'react';
import './UniButton.css';

type UniButtonProps = {
  onClick: () => void;
  selected?: boolean;
  label?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  className?: string;
};

const UniButton: FC<UniButtonProps> = React.memo(({
  onClick,
  selected = false,
  label,
  icon,
  ariaLabel,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`theme-button ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel || label}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
});

export default UniButton;
