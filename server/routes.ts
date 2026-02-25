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

  // Based on your specific account's model list (DR-006), 
  // we'll use gemini-flash-latest to avoid the 429 quota limits on 2.0.
  const modelName = "gemini-flash-latest";

  console.log(`[gemini] Initializing models with: ${modelName}`);

  return {
    model: genAI.getGenerativeModel({ model: modelName }),
    jsonModel: genAI.getGenerativeModel({
      model: modelName,
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

      const prompt = `Generate a high-end, professional resume for:
Name: ${input.fullName}
Job Title: ${input.jobTitle}
Skills: ${input.skills}
Work Experience: ${input.workExperience}
Education: ${input.education}
${input.certifications ? `Certifications: ${input.certifications}` : ''}
${input.targetJobDescription ? `Target Job Description: ${input.targetJobDescription}` : ''}

CRITICAL INSTRUCTIONS:
1. Use semantic HTML5 only (Header, Section, Main).
2. Use specific class names for styling: 
   - Wrap the whole content in <div class="premium-resume">
   - HEADER: Use <header class="resume-header"><h1>NAME</h1><div class="subtitle">JOB TITLE | CONTACT</div></header>
   - SECTIONS: Use <section> with <h2> headers
   - SKILLS: Use a <table class="skills-table"> where each row is <tr><td class="category">CATEGORY_NAME</td><td class="items">SKILL1, SKILL2...</td></tr>
   - EXPERIENCE: Each job must be in an <div class="exp-item">
     - Job Header: <div class="exp-header"><span>ROLE</span><span class="date">DATE</span></div>
     - Company Info: <div class="company-info"><span>COMPANY NAME</span><span>LOCATION</span></div>
     - Accomplishments: Use <ul> and <li> for STAR method achievements.
3. Content Quality: Focus on high-impact, measurable achievements.
4. Output raw HTML only. Do NOT include markdown code blocks or backticks.

REQUIRED HTML STRUCTURE:
<div class="premium-resume">
  <header class="resume-header">
    <h1>NAME</h1>
    <div class="subtitle">JOB TITLE | LOCATION | EMAIL | PHONE</div>
  </header>
  
  <section>
    <h2>Professional Summary</h2>
    <p>SUMMARY_TEXT</p>
  </section>

  <section>
    <h2>Technical Expertise</h2>
    <table class="skills-table">
      <tr><td class="category">Frontend</td><td class="items">React, Next.js, etc.</td></tr>
    </table>
  </section>

  <section>
    <h2>Work Experience</h2>
    <div class="exp-item">
      <div class="exp-header"><span>ROLE</span><span class="date">DATE</span></div>
      <div class="company-info"><span>COMPANY</span><span>LOCATION</span></div>
      <ul><li>ACHIEVEMENT</li></ul>
    </div>
  </section>
</div>`;

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
      console.log("[generate] Input parsed for company:", input.companyName);

      const prompt = `Generate a high-end, professional cover letter for the following context:
Company Name: ${input.companyName}
Target Job Role: ${input.jobRole}
My Skills: ${input.skills}
My Experience Summary: ${input.experienceSummary}

Format the output in CLEAN, SEMANTIC HTML using THESE EXACT CLASSES for a Vibrant Premium look:
1. Wrap everything in <div class="premium-letter">
2. Header: <div class="letter-header"><h1>[Full Name]</h1><div class="contact-info"><span>[Email]</span> | <span>[Phone]</span> | <span>[LinkedIn/Portfolio]</span></div></div>
3. Recipient: <div class="recipient-info"><div class="date">[Current Date]</div><div class="manager">Hiring Manager</div><div class="company">${input.companyName}</div></div>
4. Subject: <div class="letter-subject">RE: Application for ${input.jobRole} Position</div>
5. Body: Use <p> tags for paragraphs. Make the tone professional and engaging.
6. Closing: <div class="closing"><p>Best regards,</p><div class="signature-name">[Full Name]</div></div>

[IMPORTANT]: Use placeholders like [Full Name] if not provided in input, but prioritize a professional look. DO NOT include markdown code block backticks.`;

      console.log("[generate] Initializing Gemini models...");
      const { model } = getGenAIModels();
      console.log("[generate] Gemini model initialized. Calling AI...");

      const result = await model.generateContent(prompt);
      console.log("[generate] AI request sent, waiting for response...");

      const response = await result.response;
      const content = response.text().replace(/```html|```/g, "").trim();
      console.log("[generate] Content successfully extracted. Length:", content?.length || 0);

      res.json({ content: content || "" });
      console.log("[generate] Success response sent for cover letter.");
    } catch (err: any) {
      console.error("[generate] COVER LETTER GENERATE FAILED!");
      console.error("[generate] Error Message:", err?.message);

      res.status(500).json({
        message: "Failed to generate cover letter. This may be due to a timeout or quota issue.",
        detail: err?.message || String(err),
        hint: "Try again in a moment or verify your GOOGLE_GEMINI_API_KEY."
      });
    }
  });

  app.post(api.resumes.optimize.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.resumes.optimize.input.parse(req.body);

      const prompt = `Act as a High-Level Technical Recruiter and Career Strategist. Analyze this resume against the target job description.
      
      Target Job Description:
      ${input.targetJobDescription}
      
      Current Resume:
      ${input.existingResume}
      
      Perform a deep gap analysis and provide:
      1. A detailed match analysis (including a % match score and strengths/weaknesses).
      2. Specific, actionable suggestions to improve the resume for this exact role (keyword optimization, metric-driven achievements, etc.).
      
      Provide your response in JSON format exactly like this:
      {
        "analysis": "HTML formatted analysis with <strong>bolding</strong> and structured sections.",
        "suggestions": "A high-fidelity HTML bulleted list of actionable improvements."
      }
      
      TONE: Professional, insightful, and strategic.`;

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const rawContent = result.response.text();
      console.log("[optimize] Raw AI Output:", rawContent);

      try {
        const cleanJson = rawContent.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(cleanJson);
        res.json(parsedResult);
      } catch (parseErr) {
        console.error("[optimize] JSON Parse Error:", parseErr);
        res.json({
          analysis: "Match analysis completed (parsing error encountered). Please try again.",
          suggestions: "<ul><li>Refine your input and try again for better results.</li></ul>"
        });
      }
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

      const prompt = `Act as an expert data extractor. Analyze this job posting URL: ${url}
      
      Extract the following information in JSON format:
      {
        "jobTitle": "...",
        "companyName": "...",
        "requirements": "Detailed list of technical and soft requirements...",
        "description": "Comprehensive summary of the role's impact and responsibilities..."
      }
      
      If you cannot access the URL directly, provide a generic but EXCEPTIONALLY high-quality template based on the domain.`;

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

      const prompt = `Act as a Senior Hiring Manager for a top-tier tech company. Based on the following resume and job description, generate 5 challenging, behavioral and technical interview questions that test for depth and cultural fit.
      
      Resume: ${input.resumeContent}
      Job Description: ${input.jobDescription}
      
      For each question, provide 'context' explaining the specific competency being tested.
      
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

      const prompt = `Act as an elite Interview Coach. Evaluate the candidate's answer.
      
      Question: ${input.question}
      Candidate Answer: ${input.answer}
      Original Context: ${input.context}
      
      Provide:
      1. CRITICAL feedback using the STAR method where applicable.
      2. A realistic score (1-10).
      3. An 'improvedAnswer' that is concise, impactful, and demonstrates executive presence.
      
      Output in JSON format:
      {
        "feedback": "...",
        "score": 8,
        "improvedAnswer": "..."
      }`;

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const rawContent = result.response.text();
      console.log("[evaluate] Raw AI Output:", rawContent);

      try {
        const cleanJson = rawContent.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(cleanJson);
        res.json(parsedResult);
      } catch (parseErr) {
        console.error("[evaluate] JSON Parse Error:", parseErr);
        res.json({
          feedback: "Thank you for your answer. Our analysis engine encountered a minor formatting issue with the AI's response.",
          score: 0,
          improvedAnswer: "Keep your response concise and focused on the STAR method."
        });
      }
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
