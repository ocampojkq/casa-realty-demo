require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const resend = new Resend(
  process.env.RESEND_API_KEY || "re_placeholder_demo_key",
);
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

console.log("DB_HOST is:", process.env.DB_HOST);
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.DB_HOST &&
    (process.env.DB_HOST.includes("render.com") ||
      process.env.DB_HOST.includes("neon.tech"))
      ? { rejectUnauthorized: false }
      : false,
});
// Setup image upload storage
// Setup image upload storage (Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "padawag-realty",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
});
const upload = multer({ storage });

// Helper: get images for a property
async function getImages(propertyId) {
  const result = await pool.query(
    "SELECT id, image_url FROM property_images WHERE property_id = $1 ORDER BY id ASC",
    [propertyId],
  );
  return result.rows;
}

// GET all properties (with their images)
app.get("/properties", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties ORDER BY created_at DESC",
    );
    const properties = await Promise.all(
      result.rows.map(async (property) => {
        property.images = await getImages(property.id);
        return property;
      }),
    );
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single property (with its images) - increments view count
app.get("/properties/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE properties SET views = views + 1 WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    const property = result.rows[0];
    property.images = await getImages(property.id);
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new property (with multiple image upload)
// POST new property (with multiple image upload)
app.post("/properties", upload.array("images", 10), async (req, res) => {
  const {
    title,
    description,
    price,
    location,
    bedrooms,
    bathrooms,
    sqft,
    property_type,
    status,
    map_link,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, sqft, property_type, status, map_link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        sqft,
        property_type,
        status || "For Sale",
        map_link || null,
      ],
    );
    const property = result.rows[0];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        console.log("Uploaded file object:", JSON.stringify(file));
        await pool.query(
          `INSERT INTO property_images (property_id, image_url) VALUES ($1, $2)`,
          [property.id, file.path],
        );
      }
    }
    property.images = await getImages(property.id);
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update property (with optional new images added)
app.put("/properties/:id", upload.array("images", 10), async (req, res) => {
  const {
    title,
    description,
    price,
    location,
    bedrooms,
    bathrooms,
    sqft,
    property_type,
    status,
    map_link,
  } = req.body;
  try {
    const query = `UPDATE properties SET title=$1, description=$2, price=$3, location=$4, bedrooms=$5, bathrooms=$6, sqft=$7, property_type=$8, status=$9, map_link=$10 WHERE id=$11 RETURNING *`;
    const params = [
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      sqft,
      property_type,
      status,
      map_link || null,
      req.params.id,
    ];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    const property = result.rows[0];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.query(
          `INSERT INTO property_images (property_id, image_url) VALUES ($1, $2)`,
          [property.id, file.path],
        );
      }
    }

    property.images = await getImages(property.id);
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a single image from a property
app.delete("/property-images/:imageId", async (req, res) => {
  try {
    await pool.query("DELETE FROM property_images WHERE id = $1", [
      req.params.imageId,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE property (images auto-delete via ON DELETE CASCADE)
app.delete("/properties/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM properties WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Simple admin login check
app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Wrong password" });
  }
});
const JWT_SECRET = process.env.JWT_SECRET || "padawagsecret123";

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed],
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// SIGNIN
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong password" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new inquiry (protected - must be signed in)

// POST new inquiry (protected - must be signed in)
app.post("/inquiries", verifyToken, async (req, res) => {
  const { property_id, name, email, phone, message } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO inquiries (property_id, user_id, name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [property_id, req.user.id, name, email, phone, message],
    );

    const propertyResult = await pool.query(
      "SELECT title FROM properties WHERE id = $1",
      [property_id],
    );
    const propertyTitle = propertyResult.rows[0]?.title || "a property";

    try {
      console.log("Attempting to send email to:", process.env.ADMIN_EMAIL);
      const emailResult = await resend.emails.send({
        from: "Padawag Realty <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL.split(",").map((e) => e.trim()),
        subject: `New Lead: ${name} interested in ${propertyTitle}`,
        html: `
      <h2>New Property Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Property:</strong> ${propertyTitle}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
      });
      console.log("Email send result:", JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr.message);
    }

    res.json({ success: true, inquiry: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// GET all inquiries (for admin)
app.get("/inquiries", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT inquiries.*, properties.title AS property_title
      FROM inquiries
      LEFT JOIN properties ON inquiries.property_id = properties.id
      ORDER BY inquiries.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user's favorites
app.get("/favorites", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT properties.*, favorites.id as favorite_id
       FROM favorites
       JOIN properties ON favorites.property_id = properties.id
       WHERE favorites.user_id = $1
       ORDER BY favorites.created_at DESC`,
      [req.user.id],
    );
    const properties = result.rows;
    for (const property of properties) {
      property.images = await getImages(property.id);
    }
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add to favorites
app.post("/favorites", verifyToken, async (req, res) => {
  const { property_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)
       ON CONFLICT (user_id, property_id) DO NOTHING RETURNING *`,
      [req.user.id, property_id],
    );
    res.json({ success: true, favorite: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE remove from favorites
app.delete("/favorites/:propertyId", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND property_id = $2",
      [req.user.id, req.params.propertyId],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET check if specific properties are favorited by user
app.get("/favorites/check", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT property_id FROM favorites WHERE user_id = $1",
      [req.user.id],
    );
    res.json(result.rows.map((r) => r.property_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update inquiry status
app.put("/inquiries/:id", async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3003, () => console.log("Property API running on port 3003"));
