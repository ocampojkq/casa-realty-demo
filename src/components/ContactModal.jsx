import { useState } from "react";
import axios from "axios";

import { API } from "../config";

export default function ContactModal({ propertyId, propertyTitle, onClose }) {
  const [step, setStep] = useState("auth"); // auth -> message -> success
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Hi, I'm interested in "${propertyTitle}". Please contact me with more details.`);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = isLogin ? "/signin" : "/signup";
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setStep("message");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleSendInquiry = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${API}/inquiries`,
        { property_id: propertyId, name: user.name, email: user.email, phone, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep("success");
    } catch (err) {
      setError("Failed to send inquiry. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>

        {step === "auth" && !user && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">{isLogin ? "Sign In" : "Sign Up"}</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Sign in to contact the agent about this property</p>

            {!isLogin && (
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-3"
              />
            )}
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </button>

            <p
              onClick={() => setIsLogin(!isLogin)}
              className="text-center text-sm text-gray-500 mt-4 cursor-pointer hover:text-blue-600"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </p>
          </>
        )}

        {(step === "message" || (user && step === "auth")) && step !== "success" && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">Contact Agent</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Send a message about "{propertyTitle}"</p>

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg mb-3"
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleSendInquiry}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
            <p className="text-gray-500 mb-6">The agent will contact you soon.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
