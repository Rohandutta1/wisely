import { type Express, type RequestHandler } from "express";
import session from "express-session";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert } from "firebase-admin/app";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Initialize Firebase Admin
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

initializeApp({
  credential: cert(serviceAccount),
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "randomsecret123",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login route (expects Firebase ID token in body)
  app.post("/api/login", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: "ID token required" });
      }

      // Verify Firebase ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };

      // Store user in session
      req.session.user = user;

      // Upsert user in database
      await storage.upsertUser({
        id: user.uid,
        email: user.email || "",
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        profileImageUrl: user.picture || "",
      });

      res.json({ message: "Login successful", user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ message: "Invalid ID token" });
    }
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // User info route
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.uid;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.user || !req.session.user.uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // Verify user still exists in Firebase
    await getAuth().getUser(req.session.user.uid);
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};