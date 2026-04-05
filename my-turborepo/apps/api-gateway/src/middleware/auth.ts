import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? "myRealm";
const KEYCLOAK_ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

let cachedPublicKey: string | null = null;

function toPem(publicKey: string) {
  const formatted = publicKey.match(/.{1,64}/g)?.join("\n") ?? publicKey;
  return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
}

async function getRealmPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;

  const response = await fetch(KEYCLOAK_ISSUER);
  if (!response.ok) {
    throw new Error(`Unable to fetch realm config: ${response.status}`);
  }

  const realm = await response.json();
  if (!realm.public_key) {
    throw new Error("Keycloak realm public key not found");
  }

  cachedPublicKey = toPem(realm.public_key);
  return cachedPublicKey;
}

export const authMiddleware = async (
  req: Request & { user?: { id: string; email?: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) return res.status(401).send("No token");

    const publicKey = await getRealmPublicKey();
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: KEYCLOAK_ISSUER,
    }) as jwt.JwtPayload;

    req.user = {
      id: decoded.sub as string,
      email: decoded.email as string | undefined,
    };

    next();
  } catch (error) {
    console.error("Token verification failed", error);
    return res.status(401).send("Invalid token");
  }
};
