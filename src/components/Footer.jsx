import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <img
            src="/images/logo.png"
            alt="Casa Realty"
            className="h-14 mb-3 bg-white p-2 rounded"
          />
          <p className="text-sm text-gray-400">
            Helping you find your perfect place, one listing at a time.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition">
                Listings
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-white transition">
                Admin
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📍 Davao City, Philippines</li>
            <li>📞 +63 912 345 6789</li>
            <li>✉️ info@casarealty-demo.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Casa Realty. All rights
          reserved.
        </p>
        <p className="mt-1">
          Website by{" "}
          <a
            href="https://jesse-kit-ocampo.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            Kit
          </a>
        </p>
      </div>
    </footer>
  );
}
