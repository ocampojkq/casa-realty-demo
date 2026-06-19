export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#055380" }}>
          Contact Us
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <p className="text-gray-700 mb-6">
            Have a question about a listing or want to schedule a viewing? Reach
            out to us using the details below.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <span className="text-gray-700">Davao City, Philippines</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <span className="text-gray-700">+63 912 345 6789</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✉️</span>
              <span className="text-gray-700">karenpadawag@gmail.com</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            You can also browse our listings and click "Contact Agent" on any
            property you're interested in to send us a direct inquiry.
          </p>
        </div>
      </div>
    </div>
  );
}
