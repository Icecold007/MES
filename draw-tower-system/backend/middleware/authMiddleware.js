const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Extract authorization header string payload
  const authHeader = req.headers["authorization"];

  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access Denied: Missing security authorization token.",
    });
  }

  try {
    // Validate the cryptographically signed token value using our secret signature key
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser; // Inject the user data context payload straight into the request object
    next(); // Pass control safely over to the next execution block (the controller)
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired operational token credentials." });
  }
};
