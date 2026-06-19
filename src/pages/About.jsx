export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#055380" }}>
          About Casa Realty
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            Casa Realty is dedicated to helping families and
            individuals find their perfect home. With a deep understanding of
            the local market and a commitment to honest, personalized service,
            we make the process of buying, selling, or renting property simple
            and stress-free.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Whether you're searching for your first home, a new investment
            property, or the perfect place to settle down, our team is here to
            guide you every step of the way.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Browse our current listings, and when you find something you love,
            reach out — we'd be happy to help you take the next step.
          </p>
        </div>
      </div>
    </div>
  );
}
