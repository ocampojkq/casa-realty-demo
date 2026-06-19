import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <img src="/images/logo.png" alt="Casa Realty" className="h-16 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-300 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
        >
          ← Back to Listings
        </Link>
      </div>
    </div>
  );
}
