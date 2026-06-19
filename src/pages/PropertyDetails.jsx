import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ContactModal from "../components/ContactModal";
import AuthModal from "../components/AuthModal";
import { API, getImageUrl } from "../config";
import Lightbox from "../components/Lightbox";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/properties/${id}`)
      .then((res) => {
        setProperty(res.data);
        return axios.get(`${API}/properties`);
      })
      .then((res) => {
        setAllProperties(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API}/favorites/check`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setIsFavorited(res.data.includes(Number(id))))
        .catch(() => {});
    }
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url,
        });
      } catch (err) {
        // user cancelled share, do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isFavorited) {
        await axios.delete(`${API}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorited(false);
      } else {
        await axios.post(
          `${API}/favorites`,
          { property_id: id },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  const handleAuthSuccess = async (token) => {
    setShowAuthModal(false);
    await axios.post(
      `${API}/favorites`,
      { property_id: id },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setIsFavorited(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="w-full h-96 bg-gray-200" />
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Property Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline inline-block">
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images || [];

  const similarProperties = allProperties
    .filter(
      (p) => p.id !== property.id && p.property_type === property.property_type,
    )
    .slice(0, 3);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  let touchStartX = 0;
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Listings
        </Link>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden fade-in">
          {images.length > 0 ? (
            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={getImageUrl(images[currentImage].image_url)}
                alt={property.title}
                className="w-full h-96 object-cover fade-in cursor-zoom-in"
                key={currentImage}
                onClick={() => setLightboxOpen(true)}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-black/70 flex items-center justify-center text-xl"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-black/70 flex items-center justify-center text-xl"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2 h-2 rounded-full ${idx === currentImage ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                  <span className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                    {currentImage + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">
              No Photos Available
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img.image_url)}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 ${idx === currentImage ? "ring-2 ring-blue-600" : "opacity-70"}`}
                />
              ))}
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {property.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {property.status}
                </span>
                <button
                  onClick={handleShare}
                  className="bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition"
                >
                  📤
                </button>
                <button
                  onClick={toggleFavorite}
                  className="bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition"
                >
                  {isFavorited ? "❤️" : "🤍"}
                </button>
              </div>
            </div>

            <p className="text-md font-bold text-gray-800 mb-4">
              ₱{Number(property.price).toLocaleString()}
            </p>

            <p className="text-gray-500 mb-6">{property.location}</p>

            <div className="mb-6 rounded-xl overflow-hidden border">
              <iframe
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                src={
                  property.map_link ||
                  `https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`
                }
              ></iframe>
            </div>

            <div className="flex gap-6 mb-6 text-gray-700 border-y py-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{property.bedrooms}</p>
                <p className="text-sm text-gray-500">Bedrooms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{property.bathrooms}</p>
                <p className="text-sm text-gray-500">Bathrooms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{property.sqft}</p>
                <p className="text-sm text-gray-500">Sqft</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{property.property_type}</p>
                <p className="text-sm text-gray-500">Type</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Contact Agent
            </button>
          </div>
        </div>

        {similarProperties.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <Link
                  to={`/property/${p.id}`}
                  key={p.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition block"
                >
                  {p.images?.[0] ? (
                    <img
                      src={getImageUrl(p.images[0].image_url)}
                      alt={p.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                      No Photo
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{p.title}</h3>
                    <p className="text-gray-800 font-semibold mt-1">
                      ₱{Number(p.price).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{p.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images.map((img) => getImageUrl(img.image_url))}
          currentIndex={currentImage}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

      {shareCopied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50">
          Link copied to clipboard!
        </div>
      )}

      {showModal && (
        <ContactModal
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
