import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAIModels = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "missing") {
    console.error("[gemini] GOOGLE_GEMINI_API_KEY is missing or invalid.");
    throw new Error("Gemini API key is not configured. Please add GOOGLE_GEMINI_API_KEY to your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return {
    model: genAI.getGenerativeModel({ model: "gemini-1.5-flash" }),
    jsonModel: genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    })
  };
};

export async function registerRoutes(
  app: Express
): Promise<Server> {
  const httpServer = createServer(app);

  const getUserId = (req: any) => req.user?.id as string;

  // Resumes
  app.get(api.resumes.list.path, isAuthenticated, async (req, res) => {
    try {
      const resumes = await storage.getResumes(getUserId(req));
      res.json(resumes);
    } catch (err: any) {
      console.error("GET RESUMES FAILED:", err);
      res.status(500).json({
        message: "Failed to fetch resumes",
        detail: err.message,
        code: err.code // Likely PG error code
      });
    }
  });

  app.get(api.resumes.get.path, isAuthenticated, async (req, res) => {
    try {
      const resume = await storage.getResume(Number(req.params.id), getUserId(req));
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (err: any) {
      console.error("GET RESUME FAILED:", err.message);
      res.status(500).json({ message: "Failed to fetch resume", detail: err.message });
    }
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
    try {
      const coverLetters = await storage.getCoverLetters(getUserId(req));
      res.json(coverLetters);
    } catch (err: any) {
      console.error("GET COVER LETTERS FAILED:", err);
      res.status(500).json({
        message: "Failed to fetch cover letters",
        detail: err.message,
        code: err.code
      });
    }
  });

  app.get(api.coverLetters.get.path, isAuthenticated, async (req, res) => {
    try {
      const cl = await storage.getCoverLetter(Number(req.params.id), getUserId(req));
      if (!cl) {
        return res.status(404).json({ message: "Cover letter not found" });
      }
      res.json(cl);
    } catch (err: any) {
      console.error("GET COVER LETTER FAILED:", err.message);
      res.status(500).json({ message: "Failed to fetch cover letter" });
    }
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
    console.log("[generate] Resume generation requested");
    try {
      console.log("[generate] Parsing input...");
      const input = api.resumes.generate.input.parse(req.body);
      console.log("[generate] Input parsed for:", input.fullName);

      const prompt = `Generate a professional resume for:
Name: ${input.fullName}
Job Title: ${input.jobTitle}
Skills: ${input.skills}
Work Experience: ${input.workExperience}
Education: ${input.education}
${input.certifications ? `Certifications: ${input.certifications}` : ''}
${input.targetJobDescription ? `Target Job Description: ${input.targetJobDescription}` : ''}

Format the output in clean HTML suitable for a rich text editor. Include standard resume sections: Summary, Experience, Education, Skills. Make it professional and achievement-oriented. Do not include markdown code block backticks.`;

      console.log("[generate] Initializing Gemini models...");
      const { model } = getGenAIModels();
      console.log("[generate] Gemini model initialized. Calling AI (this may take time)...");

      const result = await model.generateContent(prompt);
      console.log("[generate] AI response received.");

      const response = await result.response;
      const content = response.text();
      console.log("[generate] Content length:", content?.length || 0);

      res.json({ content: content || "" });
      console.log("[generate] Success response sent.");
    } catch (err: any) {
      console.error("[generate] RESUME GENERATE FAILED:", err);
      if (err?.message?.includes("404")) {
        return res.status(500).json({
          message: "AI Model Error",
          detail: "The Gemini model 'gemini-1.5-flash' could not be found. Please check if your API key is valid and has access to this model."
        });
      }
      res.status(500).json({
        message: "Failed to generate resume",
        detail: err?.message || String(err),
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined
      });
    }
  });

  app.post(api.coverLetters.generate.path, isAuthenticated, async (req, res) => {
    console.log("[generate] Cover letter generation requested");
    try {
      console.log("[generate] Parsing input...");
      const input = api.coverLetters.generate.input.parse(req.body);
      console.log("[generate] Input parsed for job role:", input.jobRole);

      const prompt = `Generate a professional cover letter for the following context:
Company Name: ${input.companyName}
Target Job Role: ${input.jobRole}
My Skills: ${input.skills}
My Experience Summary: ${input.experienceSummary}

Format the output in clean HTML suitable for a rich text editor. Make the tone professional, engaging, and directly connecting my skills to the target role. Do not include markdown code block backticks.`;

      console.log("[generate] Initializing Gemini models...");
      const { model } = getGenAIModels();
      console.log("[generate] Gemini model initialized. Calling AI...");

      const result = await model.generateContent(prompt);
      console.log("[generate] AI response received.");

      const response = await result.response;
      const content = response.text();
      console.log("[generate] Content length:", content?.length || 0);

      res.json({ content: content || "" });
      console.log("[generate] Success response sent.");
    } catch (err: any) {
      console.error("[generate] COVER LETTER GENERATE FAILED:", err);
      res.status(500).json({
        message: "Failed to generate cover letter",
        detail: err?.message || String(err),
        type: err?.name
      });
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

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"analysis": "", "suggestions": ""}');
      res.json(parsedResult);
    } catch (err: any) {
      console.error("RESUME OPTIMIZE FAILED:", err);
      res.status(500).json({
        message: "Failed to optimize resume",
        detail: err?.message || String(err)
      });
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

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"jobTitle": "", "companyName": "", "requirements": "", "description": ""}');
      res.json(parsedResult);
    } catch (err: any) {
      console.error("JOB FETCH FAILED:", err);
      res.status(500).json({
        message: "Failed to fetch job details",
        detail: err?.message || String(err)
      });
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

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"questions": []}');
      res.json(parsedResult);
    } catch (err: any) {
      console.error("QUESTIONS GENERATE FAILED:", err);
      res.status(500).json({
        message: "Failed to generate questions",
        detail: err?.message || String(err)
      });
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

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const content = result.response.text();
      const parsedResult = JSON.parse(content || '{"feedback": "", "score": 0, "improvedAnswer": ""}');
      res.json(parsedResult);
    } catch (err: any) {
      console.error("INTERVIEW EVALUATE FAILED:", err);
      res.status(500).json({
        message: "Failed to evaluate answer",
        detail: err?.message || String(err)
      });
    }
  });

  return httpServer;
}
