import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateEnglishTest } from "./openai";
import { insertTestSchema } from "@shared/schema";
import { seedDatabase } from "./seedData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database with sample data
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Failed to seed database:", error);
  }

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Test routes
  app.post('/api/tests/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { difficulty, duration } = req.body;
      
      if (!difficulty || !duration) {
        return res.status(400).json({ message: "Difficulty and duration are required" });
      }

      const questions = await generateEnglishTest(difficulty, duration);
      res.json({ questions });
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ message: "Failed to generate test" });
    }
  });

  app.post('/api/tests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testData = insertTestSchema.parse({
        ...req.body,
        userId
      });

      const test = await storage.createTest(testData);
      res.json(test);
    } catch (error) {
      console.error("Error creating test:", error);
      res.status(500).json({ message: "Failed to save test results" });
    }
  });

  app.get('/api/tests/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tests = await storage.getUserTests(userId);
      res.json(tests);
    } catch (error) {
      console.error("Error fetching test history:", error);
      res.status(500).json({ message: "Failed to fetch test history" });
    }
  });

  // College routes
  app.get('/api/colleges', async (req, res) => {
    try {
      const { course, location, minFees, maxFees } = req.query;
      
      if (course || location || minFees || maxFees) {
        const colleges = await storage.searchColleges({
          course: course as string,
          location: location as string,
          minFees: minFees ? parseInt(minFees as string) : undefined,
          maxFees: maxFees ? parseInt(maxFees as string) : undefined,
        });
        res.json(colleges);
      } else {
        const colleges = await storage.getAllColleges();
        res.json(colleges);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
      res.status(500).json({ message: "Failed to fetch colleges" });
    }
  });

  app.get('/api/colleges/:id', async (req, res) => {
    try {
      const college = await storage.getCollegeById(parseInt(req.params.id));
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
      res.json(college);
    } catch (error) {
      console.error("Error fetching college:", error);
      res.status(500).json({ message: "Failed to fetch college" });
    }
  });

  // Teacher routes
  app.get('/api/teachers', async (req, res) => {
    try {
      const { subject, minExperience, maxRate } = req.query;
      
      if (subject || minExperience || maxRate) {
        const teachers = await storage.searchTeachers({
          subject: subject as string,
          minExperience: minExperience ? parseInt(minExperience as string) : undefined,
          maxRate: maxRate ? parseInt(maxRate as string) : undefined,
        });
        res.json(teachers);
      } else {
        const teachers = await storage.getAllTeachers();
        res.json(teachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get('/api/teachers/:id', async (req, res) => {
    try {
      const teacher = await storage.getTeacherById(parseInt(req.params.id));
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const booking = await storage.createBooking({
        ...req.body,
        userId,
        status: 'pending'
      });
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
