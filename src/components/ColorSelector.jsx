import { memo } from "react";

function SelectedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 512 512"
    >
      <g transform="translate(512 0) scale(-1 1)">
        <path
          fill="currentColor"
          d="M60.81 476.91h300v-60h-300v60zm233.79-347.3l13.94 7.39c31.88-43.62 61.34-31.85 61.34-31.85l-21.62 53l35.64 19l2.87 33l64.42 108.75l-43.55 29.37s-26.82-36.39-39.65-43.66c-10.66-6-41.22-10.25-56.17-12l-67.54-76.91l-12 10.56l37.15 42.31c-.13.18-.25.37-.38.57c-35.78 58.17 23 105.69 68.49 131.78H84.14C93 85 294.6 129.61 294.6 129.61z"
        />
      </g>
    </svg>
  );
}

const Option = memo(
  function Option({ value, label, selected, onSelect, className }) {
    return (
      <label
        htmlFor={`color-${value}`}
        className={`control button ${className || ""}`}
      >
        <input
          className="hidden"
          type="radio"
          name="myColor"
          onChange={onSelect}
          checked={!!selected}
          id={`color-${value}`}
        />
        <span>{label}</span>
        {!!selected && <SelectedIcon />}
      </label>
    );
  },
  (prev, next) => prev.selected === next.selected
);
Option.displayName = "Option";

function ColorSelector({ selected, onSelect }) {
  const options = [
    { value: "w", label: "White" },
    { value: "b", label: "Black" },
  ];

  return (
    <div className="controls">
      {options.map(({ value, label }) => (
        <Option
          key={value}
          value={value}
          label={label}
          selected={selected === value}
          onSelect={() => onSelect(value)}
          className={value === "w" ? "button-outline" : ""}
        />
      ))}
    </div>
  );
}

export default ColorSelector;
