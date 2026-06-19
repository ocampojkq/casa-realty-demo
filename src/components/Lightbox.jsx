import { useEffect } from "react";

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) {
  let touchStartX = 0;
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onNext();
      else onPrev();
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition"
      >
        ×
      </button>

      <span className="absolute top-5 left-5 text-white/80 text-sm">
        {currentIndex + 1} / {images.length}
      </span>

      {images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition"
        >
          ‹
        </button>
      )}

      <img
        src={images[currentIndex]}
        alt=""
        className="w-full h-full max-w-[95vw] max-h-[90vh] object-contain p-4"
      />

      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition"
        >
          ›
        </button>
      )}
    </div>
  );
}
