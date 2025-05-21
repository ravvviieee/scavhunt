import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { clueLocation, gameState, submissionSchema, insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, isAdmin, configureSession, login, register, logout, getCurrentUser } from "./auth";
import { upload, getImageUrl } from "./upload";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize locations data if it doesn't exist
  await initializeLocationsData();
  
  // Configure session management
  configureSession(app);
  
  // Serve uploaded files
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', (req: any, res, next) => {
    // Only serve images to authenticated users
    if (req.session.userId) {
      next();
    } else {
      res.status(401).send('Login required to view images');
    }
  });
  app.use('/uploads', express.static(uploadDir));

  // *** Authentication Routes ***
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/me", getCurrentUser);

  // *** Game Location Routes ***
  // Get all locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // *** Game State Routes ***
  // Get game state
  app.get("/api/game-state", async (req, res) => {
    try {
      const userId = req.session.userId;
      const state = await storage.getGameState(userId);
      if (!state) {
        return res.status(404).json({ message: "Game state not found" });
      }
      res.json(state);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  // Save game state
  app.post("/api/game-state", async (req, res) => {
    try {
      const parsedBody = gameState.parse({
        ...req.body,
        userId: req.session.userId
      });
      await storage.saveGameState(parsedBody);
      res.status(200).json({ message: "Game state saved successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid game state data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save game state" });
      }
    }
  });

  // *** User Submission Routes ***
  // Submit an answer with an image
  app.post("/api/submissions", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image upload is required" });
      }

      const { locationId, answer } = req.body;
      
      if (!locationId || !answer) {
        return res.status(400).json({ message: "LocationId and answer are required" });
      }

      // Get location to check if answer is correct
      const location = await storage.getLocation(parseInt(locationId));
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      // Check if answer is correct
      const normalizedUserAnswer = answer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      const normalizedCorrectAnswer = location.answer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      const isCorrect = normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
                       normalizedCorrectAnswer.includes(normalizedUserAnswer);

      // Create submission
      const submission = await storage.createSubmission({
        userId: req.session.userId!,
        locationId: parseInt(locationId),
        imageUrl: getImageUrl(req.file.filename),
        answer,
        correctAnswer: isCorrect
      });

      res.status(201).json(submission);
    } catch (error) {
      console.error('Submission error:', error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Get user's submissions
  app.get("/api/submissions/my", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByUserId(req.session.userId!);
      res.status(200).json(submissions);
    } catch (error) {
      console.error('Fetch submissions error:', error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // *** Admin Routes ***
  // Get all submissions (Admin only)
  app.get("/api/admin/submissions", isAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.status(200).json(submissions);
    } catch (error) {
      console.error('Admin fetch submissions error:', error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Review a submission (Admin only)
  app.put("/api/admin/submissions/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminComment, reviewed } = req.body;
      
      if (!adminComment || reviewed === undefined) {
        return res.status(400).json({ message: "Admin comment and reviewed status are required" });
      }

      const updatedSubmission = await storage.updateSubmission(
        parseInt(id),
        adminComment,
        reviewed
      );

      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error('Admin review submission error:', error);
      res.status(500).json({ message: "Failed to review submission" });
    }
  });

  // *** Basic Routes ***
  // Intro page
  app.get("/api/intro", (req, res) => {
    res.json({
      title: "Scavenger Hunt Adventure",
      instructions: [
        "Welcome to our interactive scavenger hunt!",
        "You'll receive clues about different locations one at a time.",
        "For each location, try to guess the answer based on the clues.",
        "If you're stuck, you can request more clues.",
        "When you solve a location, take a photo of it (or something related) to prove your answer.",
        "Your progress is saved, so you can continue the hunt anytime.",
        "Complete all locations to finish the hunt!",
        "Admins will review your submissions and provide feedback."
      ]
    });
  });
  
  // Create server and return
  const httpServer = createServer(app);
  return httpServer;
}

// Initialize locations data with the predefined clues
async function initializeLocationsData() {
  const existingLocations = await storage.getAllLocations();
  
  if (existingLocations.length === 0) {
    const locationsData = [
      {
        name: "Prime Pizza",
        clues: [
          "It is a restaurant where they sell food that everyone likes.",
          "It is a place where they sell a type of Italian food.",
          "They create this food in a New York way."
        ],
        answer: "Prime Pizza"
      },
      {
        name: "Prince Street Pizza",
        clues: [
          "It's a place famous for its Sicilian-style pizza.",
          "Its name includes a well-known New York street.",
          "It started in NYC and is known for its thick, square slices."
        ],
        answer: "Prince Street Pizza"
      },
      {
        name: "Hamilton Park",
        clues: [
          "A place that receives the name of a Founding Father of the US",
          "Is a place where you can go with family and friends to have a good time",
          "It's a big green space with lots of grass and trees."
        ],
        answer: "Hamilton Park"
      },
      {
        name: "McDonald Park",
        clues: [
          "This place is called like a big chain of fast food restaurants",
          "It has a soccer field",
          "It's a place to play and enjoy outdoor activities"
        ],
        answer: "McDonald Park"
      },
      {
        name: "Rose Bowl",
        clues: [
          "It is the place where different athletic events take place",
          "It has the name of a flower",
          "It is the home of the LAFC, UCLA and other teams"
        ],
        answer: "Rose Bowl"
      },
      {
        name: "Huntington Museum",
        clues: [
          "It's a museum named after an important family.",
          "It's a place where you can see art, gardens, and a library.",
          "It has a large collection of rare books, European art, and exotic plants."
        ],
        answer: "Huntington Museum"
      },
      {
        name: "Bloomfield Creamery",
        clues: [
          "It's a place where you can get something cold and sweet.",
          "Its name includes a flower showing all of its petals and a field.",
          "They serve ice cream in many different flavors."
        ],
        answer: "Bloomfield Creamery"
      },
      {
        name: "Starbucks",
        clues: [
          "It's a place where many people go for coffee or tea.",
          "Its logo is a green mermaid.",
          "You can order drinks, snacks, and even work or study there."
        ],
        answer: "Starbucks"
      }
    ];

    for (const location of locationsData) {
      await storage.addLocation(location);
    }
  }
}
