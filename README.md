Resume Skills Extractor

A React-based web application that extracts skills from resume (CV) PDFs directly in the browser and sends the text to a local backend for skill analysis.


Main Functions

PDF Upload: Accepts .pdf files via file input.
Client-Side PDF Parsing: Use pdfjs-dist to extract text from uploaded PDFs in the browser—no file is sent to the server during parsing.
Manual Text Input: Users can paste resume text directly if PDF parsing is not needed or fails.
Skill Extraction: Sends parsed resume text to a local backend endpoint (http://localhost:3000/extract-skills) to retrieve structured skills.
Error Handling: 
Alerts users if the PDF is scanned, password-protected, or invalid.
Validates file type and backend availability.
        
