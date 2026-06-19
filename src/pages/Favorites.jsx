import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, getImageUrl } from "../config";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    axios
      .get(`${API}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-xl">Loading favorites...</div>;
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Sign in to view favorites
          </h2>
          <p className="text-gray-500 mb-4">
            Save properties you love by clicking the heart icon.
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          My Favorites ({favorites.length})
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Browse listings and tap the heart icon on properties you love to
              save them here.
            </p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition inline-block"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.map((property, index) => (
              <Link
                to={`/property/${property.id}`}
                key={property.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block fade-in"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
              >
                {property.images?.[0] ? (
                  <img
                    src={getImageUrl(property.images[0].image_url)}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    No Photo
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {property.title}
                  </h2>
                  <p className="text-gray-800 font-semibold text-md mt-1">
                    ₱{Number(property.price).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {property.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
