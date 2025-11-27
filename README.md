Resume Skills Extractor – Mini AI Application

Overview

The Resume Skills Extractor is a Node.js application that automatically identifies and lists all skills mentioned in a CV or multiple CVs. 
It outputs structured JSON data suitable for applicant tracking systems (ATS). The application uses Google Gemini AI (via @google/genai) for skill extraction and includes a fallback parser to 
ensure reliable results even if the AI is unavailable.

Features

Extract skills from a single resume or multiple resumes at once.

Returns structured JSON with an array of skills per resume.

Uses AI (Gemini) for accurate skill identification.

Includes a fallback parser that uses a predefined skill list and regular expressions to handle AI failures.

Handles special characters in skills like C++, C#, and multi-word skills.

Easy to integrate with ATS or other HR applications.

Project Structure

resume-skills-extractor/
│
├─ server.js            
├─ package.json         
├─ .env                 
└─ README.md           

Functionality

Server Setup

Uses Express.js with body-parser and CORS.

Reads the Gemini API key from .env file.

API Endpoint

POST /extract-skills

Request Body:

{
  "resumes": [
    "John Doe is skilled in Java, Python, React, Node.js, SQL, teamwork, leadership, cloud computing, and UI/UX design."
  ]
}



Response:

{
    "results": [
        {
            "skills": [
                "Java",
                "Python",
                "React",
                "Node.js",
                "SQL",
                "Leadership",
                "Teamwork",
                "UI/UX"
            ]
        }
    ]
}


Skill Extraction Process

Step 1: AI Extraction
Uses Gemini AI (gemini-2.5-flash) to generate a JSON object of skills.

Step 2: Fallback Parser
If AI fails or returns an empty result, the server uses a predefined skill list and regular expression to extract skills from the resume text.

Error Handling

Returns meaningful messages for empty or invalid inputs.
Ensures skills array is always returned, even if AI fails.
