function IconButton({ label, children, className = "", ...buttonProps }) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

export default IconButton;
