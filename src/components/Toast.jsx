import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className={`${styles[type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium`}>
        {type === "success" ? "✓" : "✕"} {message}
      </div>
    </div>
  );
}
