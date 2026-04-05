import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).send("No token");

  const decoded: any = jwt.decode(token);

  req.user = {
    id: decoded.sub,   // 👈 KEYCLOAK ID
    email: decoded.email
  };

  next();
};