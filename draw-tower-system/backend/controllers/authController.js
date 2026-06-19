const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// User Registration Flow
exports.signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password fields are strictly required." });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        message: "An administrative account with this email already exists.",
      });
    }

    // Encrypt password string with standard 10 salt rounds
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Write straight to database
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password_hash: passwordHash }])
      .select()
      .single();

    if (error) throw error;

    return res
      .status(201)
      .json({ message: "Administrative user registered successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error during registration.",
      error: error.message,
    });
  }
};

// User Authorization Login Flow
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both valid email and password inputs.",
      });
    }

    // Locate the user record inside PostgreSQL
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials provided." });
    }

    // Compare incoming password with hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials provided." });
    }

    // Generate JWT token containing context metadata
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }, // Operational shift lifespan
    );

    return res.status(200).json({
      message: "Login session authorized.",
      token,
      user: { email: user.email },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error during login validation.",
      error: error.message,
    });
  }
};

// Logout Request Endpoint Handler
exports.logout = async (req, res) => {
  // Since tokens are stateless and tracked memory-side within the browser cache client,
  // we simply send a verification response back to command the frontend to drop its local token.
  return res.status(200).json({ message: "Session logged out successfully." });
};
