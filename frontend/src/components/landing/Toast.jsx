function Toast({ message, tone = "success" }) {
  if (!message) {
    return null;
  }

  return <div className={`toast-message ${tone}`}>{message}</div>;
}

export default Toast;
