function LoadingIndicator({ label = "読み込んでいます" }) {
  return (
    <span className="loading-indicator" role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </span>
  );
}

export default LoadingIndicator;
