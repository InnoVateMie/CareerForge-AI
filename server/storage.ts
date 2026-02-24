import { db } from "./db";
import {
  resumes,
  coverLetters,
  type InsertResume,
  type InsertCoverLetter,
  type Resume,
  type CoverLetter
} from "../shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getResumes(userId: string): Promise<Resume[]>;
  getResume(id: number, userId: string): Promise<Resume | undefined>;
  createResume(userId: string, resume: InsertResume): Promise<Resume>;
  updateResume(id: number, userId: string, updates: Partial<InsertResume>): Promise<Resume>;
  deleteResume(id: number, userId: string): Promise<void>;

  getCoverLetters(userId: string): Promise<CoverLetter[]>;
  getCoverLetter(id: number, userId: string): Promise<CoverLetter | undefined>;
  createCoverLetter(userId: string, coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  updateCoverLetter(id: number, userId: string, updates: Partial<InsertCoverLetter>): Promise<CoverLetter>;
  deleteCoverLetter(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getResumes(userId: string): Promise<Resume[]> {
    return await db!.select().from(resumes).where(eq(resumes.userId, userId));
  }

  async getResume(id: number, userId: string): Promise<Resume | undefined> {
    const [resume] = await db!.select().from(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
    return resume;
  }

  async createResume(userId: string, resume: InsertResume): Promise<Resume> {
    const [created] = await db!.insert(resumes).values({ ...resume, userId }).returning();
    return created;
  }

  async updateResume(id: number, userId: string, updates: Partial<InsertResume>): Promise<Resume> {
    const [updated] = await db!
      .update(resumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .returning();
    if (!updated) throw new Error("Resume not found");
    return updated;
  }

  async deleteResume(id: number, userId: string): Promise<void> {
    await db!.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
  }

  async getCoverLetters(userId: string): Promise<CoverLetter[]> {
    return await db!.select().from(coverLetters).where(eq(coverLetters.userId, userId));
  }

  async getCoverLetter(id: number, userId: string): Promise<CoverLetter | undefined> {
    const [cl] = await db!.select().from(coverLetters).where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));
    return cl;
  }

  async createCoverLetter(userId: string, coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const [created] = await db!.insert(coverLetters).values({ ...coverLetter, userId }).returning();
    return created;
  }

  async updateCoverLetter(id: number, userId: string, updates: Partial<InsertCoverLetter>): Promise<CoverLetter> {
    const [updated] = await db!
      .update(coverLetters)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)))
      .returning();
    if (!updated) throw new Error("Cover letter not found");
    return updated;
  }

  async deleteCoverLetter(id: number, userId: string): Promise<void> {
    await db!.delete(coverLetters).where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
