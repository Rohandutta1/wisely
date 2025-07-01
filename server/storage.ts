import {
  users,
  tests,
  colleges,
  teachers,
  bookings,
  type User,
  type UpsertUser,
  type InsertTest,
  type Test,
  type InsertCollege,
  type College,
  type InsertTeacher,
  type Teacher,
  type InsertBooking,
  type Booking,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Test operations
  createTest(test: InsertTest): Promise<Test>;
  getUserTests(userId: string): Promise<Test[]>;
  getTestById(id: number): Promise<Test | undefined>;
  
  // College operations
  searchColleges(filters: {
    course?: string;
    location?: string;
    minFees?: number;
    maxFees?: number;
  }): Promise<College[]>;
  getAllColleges(): Promise<College[]>;
  getCollegeById(id: number): Promise<College | undefined>;
  createCollege(college: InsertCollege): Promise<College>;
  
  // Teacher operations
  searchTeachers(filters: {
    subject?: string;
    minExperience?: number;
    maxRate?: number;
  }): Promise<Teacher[]>;
  getAllTeachers(): Promise<Teacher[]>;
  getTeacherById(id: number): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getTeacherBookings(teacherId: number): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Test operations
  async createTest(test: InsertTest): Promise<Test> {
    const [newTest] = await db.insert(tests).values(test).returning();
    return newTest;
  }

  async getUserTests(userId: string): Promise<Test[]> {
    return await db
      .select()
      .from(tests)
      .where(eq(tests.userId, userId))
      .orderBy(desc(tests.completedAt));
  }

  async getTestById(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  // College operations
  async searchColleges(filters: {
    course?: string;
    location?: string;
    minFees?: number;
    maxFees?: number;
  }): Promise<College[]> {
    let query = db.select().from(colleges);
    
    const conditions = [];
    if (filters.course) {
      // Search in courses array - simplified for now
      conditions.push(ilike(colleges.name, `%${filters.course}%`));
    }
    if (filters.location) {
      conditions.push(ilike(colleges.location, `%${filters.location}%`));
    }
    if (filters.minFees) {
      conditions.push(gte(colleges.fees, filters.minFees));
    }
    if (filters.maxFees) {
      conditions.push(lte(colleges.fees, filters.maxFees));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getAllColleges(): Promise<College[]> {
    return await db.select().from(colleges).orderBy(colleges.ranking);
  }

  async getCollegeById(id: number): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college;
  }

  async createCollege(college: InsertCollege): Promise<College> {
    const [newCollege] = await db.insert(colleges).values(college).returning();
    return newCollege;
  }

  // Teacher operations
  async searchTeachers(filters: {
    subject?: string;
    minExperience?: number;
    maxRate?: number;
  }): Promise<Teacher[]> {
    let query = db.select().from(teachers);
    
    const conditions = [];
    if (filters.minExperience) {
      conditions.push(gte(teachers.experience, filters.minExperience));
    }
    if (filters.maxRate) {
      conditions.push(lte(teachers.hourlyRate, filters.maxRate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(teachers.rating));
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers).orderBy(desc(teachers.rating));
  }

  async getTeacherById(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [newTeacher] = await db.insert(teachers).values(teacher).returning();
    return newTeacher;
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getTeacherBookings(teacherId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.teacherId, teacherId))
      .orderBy(desc(bookings.createdAt));
  }
}

export const storage = new DatabaseStorage();
