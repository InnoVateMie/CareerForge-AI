import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  const getUserId = (req: any) => req.user?.claims?.sub as string;

  // Resumes
  app.get(api.resumes.list.path, isAuthenticated, async (req, res) => {
    const resumes = await storage.getResumes(getUserId(req));
    res.json(resumes);
  });

  app.get(api.resumes.get.path, isAuthenticated, async (req, res) => {
    const resume = await storage.getResume(Number(req.params.id), getUserId(req));
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  });

  app.post(api.resumes.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.resumes.create.input.parse(req.body);
      const resume = await storage.createResume(getUserId(req), input);
      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.resumes.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.resumes.update.input.parse(req.body);
      const resume = await storage.updateResume(Number(req.params.id), getUserId(req), input);
      res.json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.resumes.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteResume(Number(req.params.id), getUserId(req));
    res.status(204).end();
  });

  // Cover Letters
  app.get(api.coverLetters.list.path, isAuthenticated, async (req, res) => {
    const coverLetters = await storage.getCoverLetters(getUserId(req));
    res.json(coverLetters);
  });

  app.get(api.coverLetters.get.path, isAuthenticated, async (req, res) => {
    const cl = await storage.getCoverLetter(Number(req.params.id), getUserId(req));
    if (!cl) {
      return res.status(404).json({ message: "Cover letter not found" });
    }
    res.json(cl);
  });

  app.post(api.coverLetters.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.coverLetters.create.input.parse(req.body);
      const cl = await storage.createCoverLetter(getUserId(req), input);
      res.status(201).json(cl);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.coverLetters.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.coverLetters.update.input.parse(req.body);
      const cl = await storage.updateCoverLetter(Number(req.params.id), getUserId(req), input);
      res.json(cl);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.coverLetters.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteCoverLetter(Number(req.params.id), getUserId(req));
    res.status(204).end();
  });

  // AI Generators
  app.post(api.resumes.generate.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.resumes.generate.input.parse(req.body);
      
      const prompt = `Generate a professional resume for:
Name: ${input.fullName}
Job Title: ${input.jobTitle}
Skills: ${input.skills}
Work Experience: ${input.workExperience}
Education: ${input.education}
${input.certifications ? `Certifications: ${input.certifications}` : ''}
${input.targetJobDescription ? `Target Job Description: ${input.targetJobDescription}` : ''}

Format the output in clean HTML suitable for a rich text editor. Include standard resume sections: Summary, Experience, Education, Skills. Make it professional and achievement-oriented. Do not include markdown code block backticks.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
      });

      res.json({ content: response.choices[0].message.content || "" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate resume" });
    }
  });

  app.post(api.coverLetters.generate.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.coverLetters.generate.input.parse(req.body);
      
      const prompt = `Generate a professional cover letter for the following context:
Company Name: ${input.companyName}
Target Job Role: ${input.jobRole}
My Skills: ${input.skills}
My Experience Summary: ${input.experienceSummary}

Format the output in clean HTML suitable for a rich text editor. Make the tone professional, engaging, and directly connecting my skills to the target role. Do not include markdown code block backticks.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
      });

      res.json({ content: response.choices[0].message.content || "" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.post(api.resumes.optimize.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.resumes.optimize.input.parse(req.body);
      
      const prompt = `Analyze this resume against the target job description and provide optimization suggestions.

Target Job Description:
${input.targetJobDescription}

Current Resume:
${input.existingResume}

Provide your response in JSON format exactly like this:
{
  "analysis": "A brief analysis of the match (e.g., 85% match. Good technical skills, missing soft skills.)",
  "suggestions": "A bulleted list in HTML of actionable suggestions to improve the resume."
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      });

      const result = JSON.parse(response.choices[0].message.content || '{"analysis": "", "suggestions": ""}');
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to optimize resume" });
    }
  });

  return httpServer;
}
