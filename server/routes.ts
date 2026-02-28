import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Stripe from "stripe";

// Lazy initialization of Stripe - only create when needed
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    stripe = new Stripe(key, { apiVersion: "2023-10-16" as any });
  }
  return stripe;
};

const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === "sandbox"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function generatePayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "Failed to generate PayPal token");
  return data.access_token;
}

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
Email: ${input.email}
Phone: ${input.phone}
Address: ${input.address}
Job Title: ${input.jobTitle}
Skills: ${input.skills}
Hobbies: ${input.hobbies || 'Not specified'}

Work Experience Summary:
${input.workExperience.map(exp => `- ${exp.role} at ${exp.company} (${exp.start} - ${exp.end}): ${exp.description}`).join('\n')}

Education Summary:
${input.education.map(edu => `- ${edu.degree} from ${edu.school} (${edu.start} - ${edu.end})`).join('\n')}

${input.certifications && input.certifications.length > 0 ? `Certifications:
${input.certifications.map(cert => `- ${cert.name} (${cert.issuer}, ${cert.date})`).join('\n')}` : ''}

${input.targetJobDescription ? `Target Job Description: ${input.targetJobDescription}` : ''}

CRITICAL INSTRUCTIONS:
1. Use semantic HTML5 only (Header, Section, Main).
2. Content Quality: Focus on high-impact, measurable achievements using the STAR method.
3. Output raw HTML only. Do NOT include markdown code blocks, backticks, or inline <style> tags.
4. Structure must strictly follow the REQUIRED HTML STRUCTURE below.
5. DESIGN VARIETY: 
   - Use <div class="boxed-title"> for dynamic section headers (Professional Summary, Experience, etc.) to give a premium boxed feel.
   - Use <table class="data-table"> for Education and Certifications to show structured data clearly.
   - Use <table class="skills-table"> for Technical Expertise.
   - Randomly decide for THIS user if they should have a "Summary Table" or a "Summary Box" at the top.

REQUIRED HTML STRUCTURE:
<div class="premium-resume">
  <header class="resume-header">
    <h1>${input.fullName}</h1>
    <div class="subtitle">${input.jobTitle.toUpperCase()}</div>
    <div class="contact-line">${input.email} | ${input.phone} | ${input.address}</div>
  </header>
  
  <section>
    <div class="boxed-title"><h2>Professional Summary</h2></div>
    <p>A compelling 3-4 sentence professional summary focusing on expertise and value proposition.</p>
  </section>

  <section>
    <div class="boxed-title"><h2>Technical Expertise</h2></div>
    <table class="skills-table">
      <tr><td class="category">Core Competencies</td><td class="items">${input.skills}</td></tr>
    </table>
  </section>

  <section>
    <div class="boxed-title"><h2>Professional Experience</h2></div>
    ${input.workExperience.map(exp => `
    <div class="exp-item">
      <div class="exp-header"><span>${exp.role.toUpperCase()}</span><span class="date">${exp.start} – ${exp.end}</span></div>
      <div class="company-info"><span>${exp.company}</span></div>
      <ul>
        <li>ACHIEVEMENT: Quantifiable result using STAR method.</li>
      </ul>
    </div>`).join('')}
  </section>

  <section>
    <div class="boxed-title"><h2>Academic Background</h2></div>
    <table class="data-table">
      ${input.education.map(edu => `
      <tr>
        <td class="main-info"><strong>${edu.degree}</strong><br/>${edu.school}</td>
        <td class="side-info">${edu.start} – ${edu.end}</td>
      </tr>`).join('')}
    </table>
  </section>

  ${input.certifications && input.certifications.length > 0 ? `
  <section>
    <div class="boxed-title"><h2>Certifications</h2></div>
    <table class="data-table">
      ${input.certifications.map(cert => `
      <tr>
        <td class="main-info"><strong>${cert.name}</strong><br/>${cert.issuer}</td>
        <td class="side-info">${cert.date}</td>
      </tr>`).join('')}
    </table>
  </section>` : ''}

  ${input.hobbies ? `
  <section>
    <div class="boxed-title"><h2>Interests & Hobbies</h2></div>
    <p>${input.hobbies}</p>
  </section>` : ''}
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
    console.log("[generate] STAGE: Request Received");
    try {
      const input = api.coverLetters.generate.input.parse(req.body);
      console.log("[generate] STAGE: Input Parsed -", input.companyName);

      const prompt = `Generate a high-end, professional cover letter for ${input.companyName} as a ${input.jobRole}.
My Skills: ${input.skills}
Experience: ${input.experienceSummary}

Format as CLEAN HTML with sections:
1. Shell: <div class="premium-letter">
2. Header: <div class="letter-header"><h1>[Full Name]</h1><div class="contact-info"><span>[Email]</span> | <span>[Phone]</span></div></div>
3. Body: Use <p> tags. Focus on impact.
4. Closing: <div class="closing"><p>Best regards,</p><div class="signature-name">[Name]</div></div>

[IMPORTANT]: HTML body ONLY. No markdown. Be concise.`;

      console.log("[generate] STAGE: Initializing Gemini with token limits");
      const { model } = getGenAIModels();

      console.log("[generate] STAGE: Calling AI API (Max Tokens: 800)...");
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        }
      });

      console.log("[generate] STAGE: Awaiting Response...");
      const response = await result.response;

      console.log("[generate] STAGE: Processing Text...");
      const rawText = response.text();
      const content = rawText.replace(/```html|```/g, "").trim();

      console.log("[generate] STAGE: Success. Length:", content?.length || 0);
      res.json({ content: content || "" });
    } catch (err: any) {
      console.error("[generate] STAGE: FAILED!");
      console.error("[generate] Error Details:", err?.message || err);

      res.status(500).json({
        message: "Failed to generate cover letter. This is likely a Netlify timeout or AI quota limit.",
        detail: err?.message || String(err),
        stage: "Generation"
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

  app.post(api.linkedin.optimizeProfile.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.linkedin.optimizeProfile.input.parse(req.body);

      let fetchedContent = "";
      if (input.linkedinUrl) {
        try {
          const response = await fetch(input.linkedinUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
          });
          const text = await response.text();
          // Just take a chunk of it to avoid token overflow if it's huge, though Gemini Flash can handle a lot.
          fetchedContent = text.substring(0, 30000);
        } catch (e) {
          console.error("Failed to fetch LinkedIn URL", e);
          fetchedContent = "Failed to fetch directly. URL provided: " + input.linkedinUrl;
        }
      }

      const prompt = `Act as an expert LinkedIn Profile Optimizer and Executive Career Coach. Based on the following information, generate a highly engaging, SEO-optimized LinkedIn profile.
      
      IMPORTANT INSTRUCTIONS FOR TONE:
      - The outcome MUST be highly realistic and human-sounding.
      - DO NOT use overly complex, bloated, academic, or robotic jargon.
      - DO NOT include unnecessary information. Focus only on the core value.
      - Make it sound like a real, approachable professional wrote it.
      
      Provided Resume/Profile Text: 
      ${input.profileOrResumeContent || 'None'}
      
      LinkedIn URL or Scraped Data:
      ${fetchedContent || input.linkedinUrl || 'None'}
      
      Output in JSON format exactly like this:
      {
        "headline": "A punchy, human-sounding keyword-rich headline (under 220 characters).",
        "summary": "An engaging, story-driven 'About' section that is highly realistic, not robotic.",
        "experienceSuggestions": [
          "Practical, simple suggestion 1",
          "Practical, simple suggestion 2",
          "Practical, simple suggestion 3"
        ]
      }`;

      const { jsonModel } = getGenAIModels();
      const result = await jsonModel.generateContent(prompt);
      const rawContent = result.response.text();

      try {
        const cleanJson = rawContent.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(cleanJson);
        res.json(parsedResult);
      } catch (parseErr) {
        res.status(500).json({
          message: "Failed to parse JSON response",
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: "Failed to optimize LinkedIn profile", detail: err?.message || String(err) });
    }
  });

  app.post(api.interview.generateQuestions.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.interview.generateQuestions.input.parse(req.body);

      const prompt = `Act as a Hiring Manager. Based on the following resume and job description, generate 5 realistic, human-level, conversational interview questions. The questions should be practical, straightforward, and focused on genuine experience rather than being overly hard, complex, or academic.
      
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

  // Payments
  app.post(api.payments.createStripeIntent.path, isAuthenticated, async (req, res) => {
    try {
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: 500, // $5.00
        currency: "usd",
        metadata: { userId: getUserId(req) },
      });
      res.json({ clientSecret: paymentIntent.client_secret! });
    } catch (err: any) {
      console.error("Stripe Intent Error:", err);
      res.status(500).json({ message: "Failed to create payment intent", detail: err.message });
    }
  });

  app.post(api.payments.verifyStripePayment.path, isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId } = api.payments.verifyStripePayment.input.parse(req.body);
      const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);

      if (intent.status === "succeeded" && intent.metadata.userId === getUserId(req)) {
        await storage.updateUserPremiumStatus(getUserId(req), true);
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment not successful or user mismatch" });
      }
    } catch (err: any) {
      res.status(500).json({ message: "Payment verification failed", detail: err.message });
    }
  });

  app.post(api.payments.createPaypalOrder.path, isAuthenticated, async (req, res) => {
    try {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error("PayPal keys not configured");
      }
      const accessToken = await generatePayPalAccessToken();
      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: "5.00",
              },
              custom_id: getUserId(req),
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create order");
      res.json({ orderID: data.id });
    } catch (err: any) {
      console.error("PayPal Order Error:", err);
      res.status(500).json({ message: "PayPal Order Error", detail: err.message });
    }
  });

  app.post(api.payments.capturePaypalOrder.path, isAuthenticated, async (req, res) => {
    try {
      const { orderID } = api.payments.capturePaypalOrder.input.parse(req.body);
      const accessToken = await generatePayPalAccessToken();
      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Capture failed");

      const purchaseUnit = data.purchase_units?.[0];
      if (data.status === "COMPLETED" && purchaseUnit?.custom_id === getUserId(req)) {
        await storage.updateUserPremiumStatus(getUserId(req), true);
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment not completed or user mismatch" });
      }
    } catch (err: any) {
      console.error("PayPal Capture Error:", err);
      res.status(500).json({ message: "PayPal Capture Error", detail: err.message });
    }
  });

  return httpServer;
}
