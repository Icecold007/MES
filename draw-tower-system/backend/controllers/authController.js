const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password fields are strictly required." });
    }

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

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both valid email and password inputs.",
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials provided." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials provided." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
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

exports.logout = async (req, res) => {
  return res.status(200).json({ message: "Session logged out successfully." });
};
