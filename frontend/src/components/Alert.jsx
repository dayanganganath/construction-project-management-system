function Alert({ type = "success", message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>

      <button type="button" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Alert;