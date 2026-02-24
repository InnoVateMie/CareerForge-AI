import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "missing");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const jsonModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

export async function registerRoutes(
  app: Express
): Promise<Server> {
  const httpServer = createServer(app);

  const getUserId = (req: any) => req.user?.id as string;

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

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      res.json({ content: content || "" });
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

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      res.json({ content: content || "" });
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

      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"analysis": "", "suggestions": ""}');
      res.json(parsedResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to optimize resume" });
    }
  });

  app.post(api.jobs.fetch.path, isAuthenticated, async (req, res) => {
    try {
      const { url } = api.jobs.fetch.input.parse(req.body);

      // In a real app, we'd fetch the URL content here.
      // For this demo/feature preview, we'll ask the AI to "simulate" or we'll provide a placeholder if it's a known site.
      // But let's try to actually fetch it if possible (some sites block).

      const prompt = `Analyze this job posting URL: ${url}
      
      Extract the following information in JSON format:
      {
        "jobTitle": "...",
        "companyName": "...",
        "requirements": "Bullet points of key requirements...",
        "description": "Short summary of the role..."
      }
      
      If you cannot access the URL directly, use your knowledge of typical postings from this domain or provide a generic but high-quality template for a role likely found at that URL.`;

      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"jobTitle": "", "companyName": "", "requirements": "", "description": ""}');
      res.json(parsedResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  app.post(api.interview.generateQuestions.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.interview.generateQuestions.input.parse(req.body);

      const prompt = `Act as an expert interviewer. Based on the following resume and job description, generate 5 challenging interview questions.
      For each question, provide a brief 'context' explaining why you are asking it or what you are looking for.
      
      Resume: ${input.resumeContent}
      Job Description: ${input.jobDescription}
      
      Output in JSON format:
      {
        "questions": [
          { "question": "...", "context": "..." }
        ]
      }`;

      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"questions": []}');
      res.json(parsedResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  app.post(api.interview.evaluateAnswer.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.interview.evaluateAnswer.input.parse(req.body);

      const prompt = `Act as an expert interviewer. Evaluate the candidate's answer to the following question.
      
      Question: ${input.question}
      Candidate Answer: ${input.answer}
      Original Context: ${input.context}
      
      Provide feedback, a score out of 10, and an 'improvedAnswer' that would be ideal.
      
      Output in JSON format:
      {
        "feedback": "...",
        "score": 8,
        "improvedAnswer": "..."
      }`;

      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"feedback": "", "score": 0, "improvedAnswer": ""}');
      res.json(parsedResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to evaluate answer" });
    }
  });

  return httpServer;
}
