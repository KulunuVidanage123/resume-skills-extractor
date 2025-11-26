import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const COMMON_SKILLS = [
  "Java", "Python", "JavaScript", "React", "Node.js", "SQL", "HTML", "CSS",
  "AWS", "Azure", "Docker", "Kubernetes", "Leadership", "Teamwork",
  "UI/UX", "Communication", "C++", "C#", "TypeScript", "Git", "Machine Learning",
  "Data Analysis", "Problem Solving"
];

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkillsFallback(resumeText) {
  return COMMON_SKILLS.filter(skill =>
    new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(resumeText)
  );
}

app.post("/extract-skills", async (req, res) => {
  const resumes = req.body.resumes;

  if (!Array.isArray(resumes) || resumes.length === 0) {
    return res.status(400).json({ error: "An array of resumes is required." });
  }

  const results = [];

  for (const resumeText of resumes) {
    let skillsData = { skills: [] };

    if (!resumeText || resumeText.trim() === "") {
      results.push(skillsData);
      continue;
    }

    const prompt = `
Extract ONLY the skills from this resume.
Return them as a JSON object in this format:
{ "skills": ["skill1", "skill2", ...] }

Resume:
${resumeText}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt
      });

      const text = response.output_text || response.contents?.[0]?.text || "";

      if (text && text.trim() !== "") {
        try {
          const parsed = JSON.parse(text);
          if (parsed.skills && Array.isArray(parsed.skills)) {
            skillsData = parsed;
          } else {
            throw new Error("Invalid JSON structure");
          }
        } catch {
          const matches = text.match(/\b[A-Za-z0-9+.#]+\b/g);
          skillsData = { skills: matches || [] };
        }
      } else {
        skillsData = { skills: extractSkillsFallback(resumeText) };
      }
    } catch (error) {
      console.error("Gemini error:", error);
      skillsData = { skills: extractSkillsFallback(resumeText) };
    }

    results.push(skillsData);
  }

  res.json({ results });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
