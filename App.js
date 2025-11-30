import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

function App() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState(""); // "success", "no-text", or ""

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setPdfStatus("");

    if (uploadedFile && uploadedFile.type === "application/pdf") {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);

        try {
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .filter(item => typeof item.str === 'string')
              .map(item => item.str)
              .join(" ");
            text += pageText + "\n\n";
          }

          const cleanedText = text.trim();
          setResumeText(cleanedText);

          if (cleanedText === "") {
            setPdfStatus("no-text");
            alert("Warning: No readable text found in the PDF. It may be a scanned/image-based resume. Try a text-based PDF for best results.");
          } else {
            setPdfStatus("success");
          }
        } catch (err) {
          console.error("Error reading PDF:", err);
          setPdfStatus("");
          alert(
            "Failed to read PDF. Please ensure it's not password-protected and is a valid PDF file."
          );
        }
      };

      fileReader.readAsArrayBuffer(uploadedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const extractSkills = async () => {
    if (!resumeText.trim()) {
      alert("No resume text available! Please upload a text-based PDF or paste text manually.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/extract-skills", {
        resumes: [resumeText],
      });

      const extractedSkills = response.data.results?.[0]?.skills || [];
      setSkills(extractedSkills);

      if (extractedSkills.length === 0) {
        alert("No skills were detected in the resume text.");
      }
    } catch (err) {
      console.error("Skill extraction error:", err);
      alert("Error extracting skills. Make sure the backend is running on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        Resume Skills Extractor
      </h1>

      <div className="max-w-3xl mx-auto bg-white shadow-lg p-6 rounded-xl">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />

        <textarea
          className="w-full h-40 border p-3 rounded-lg resize-none"
          placeholder="Paste resume text here or upload a PDF..."
          value={resumeText}
          onChange={(e) => {
            setResumeText(e.target.value);
            setPdfStatus(""); // Reset status when user edits manually
          }}
        />

        <button
          onClick={extractSkills}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-medium"
          disabled={loading || !resumeText.trim()}
        >
          {loading ? "Extracting..." : "Extract Skills"}
        </button>

        {pdfStatus === "no-text" && (
          <p className="text-yellow-600 text-sm mt-2">
            ⚠️ This PDF appears to be image-based. Only text-based resumes can be processed.
          </p>
        )}

        <h2 className="text-xl font-bold mt-6">Extracted Skills</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {skills.length > 0 ? (
            skills.map((skill, i) => (
              <span
                key={i}
                className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-400 italic">
              {resumeText ? "No skills found." : "No skills extracted yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;