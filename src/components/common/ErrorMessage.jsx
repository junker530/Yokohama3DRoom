function ErrorMessage({ title = "読み込めませんでした", message, action }) {
  return (
    <section className="error-message" role="alert">
      <div className="error-message__icon" aria-hidden="true">!</div>
      <h1>{title}</h1>
      {message && <p>{message}</p>}
      {action}
    </section>
  );
}

export default ErrorMessage;
