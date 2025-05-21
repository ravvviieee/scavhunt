import { db } from "./db";
import { 
  ClueLocation, 
  GameState, 
  InsertUser, 
  User, 
  users, 
  locations, 
  submissions, 
  Submission,
  InsertSubmission
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import * as bcrypt from "bcrypt";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Scavenger Hunt methods
  getAllLocations(): Promise<ClueLocation[]>;
  getLocation(id: number): Promise<ClueLocation | undefined>;
  addLocation(location: ClueLocation): Promise<ClueLocation>;
  getGameState(userId?: number): Promise<GameState | null>;
  saveGameState(state: GameState): Promise<void>;

  // Submission methods
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByUserId(userId: number): Promise<Submission[]>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  getAllSubmissions(): Promise<Submission[]>;
  updateSubmission(id: number, adminComment: string, reviewed: boolean): Promise<Submission | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    
    return user;
  }

  // Scavenger Hunt methods
  async getAllLocations(): Promise<ClueLocation[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: number): Promise<ClueLocation | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async addLocation(location: ClueLocation): Promise<ClueLocation> {
    const [newLocation] = await db
      .insert(locations)
      .values(location)
      .returning();
    
    return newLocation;
  }

  private gameState: GameState | null = null;

  async getGameState(userId?: number): Promise<GameState | null> {
    return this.gameState;
  }

  async saveGameState(state: GameState): Promise<void> {
    this.gameState = state;
  }

  // Submission methods
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    
    return newSubmission;
  }

  async getSubmissionsByUserId(userId: number): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    
    return submission;
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.submittedAt));
  }

  async updateSubmission(id: number, adminComment: string, reviewed: boolean): Promise<Submission | undefined> {
    const [updatedSubmission] = await db
      .update(submissions)
      .set({
        adminComment,
        reviewed
      })
      .where(eq(submissions.id, id))
      .returning();
    
    return updatedSubmission;
  }
}

// Initialize memory storage for backward compatibility if needed
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, ClueLocation>;
  private gameState: GameState | null = null;
  private submissionsData: Map<number, Submission>;
  currentId: number;
  locationId: number;
  submissionId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.submissionsData = new Map();
    this.currentId = 1;
    this.locationId = 1;
    this.submissionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }

  async getAllLocations(): Promise<ClueLocation[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: number): Promise<ClueLocation | undefined> {
    return this.locations.get(id);
  }

  async addLocation(location: ClueLocation): Promise<ClueLocation> {
    const id = this.locationId++;
    const newLocation: ClueLocation = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async getGameState(userId?: number): Promise<GameState | null> {
    return this.gameState;
  }

  async saveGameState(state: GameState): Promise<void> {
    this.gameState = state;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = this.submissionId++;
    const newSubmission: Submission = {
      ...submission,
      id,
      submittedAt: new Date(),
      adminComment: null,
      reviewed: false
    };
    
    this.submissionsData.set(id, newSubmission);
    return newSubmission;
  }

  async getSubmissionsByUserId(userId: number): Promise<Submission[]> {
    return Array.from(this.submissionsData.values())
      .filter(sub => sub.userId === userId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    return this.submissionsData.get(id);
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissionsData.values())
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async updateSubmission(id: number, adminComment: string, reviewed: boolean): Promise<Submission | undefined> {
    const submission = this.submissionsData.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission: Submission = {
      ...submission,
      adminComment,
      reviewed
    };
    
    this.submissionsData.set(id, updatedSubmission);
    return updatedSubmission;
  }
}

// Use database storage
export const storage = new DatabaseStorage();
