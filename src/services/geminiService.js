import { extractJdKeywords } from "./atsAnalyzer";

const STORAGE_KEY = "cv_tailor_gemini_api_key";

export function getStoredApiKey() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Intelligent built-in rule-based tailoring engine (works instantly without API key)
 * @param {object} originalCv
 * @param {string} jobDescription
 * @returns {object} { tailoredCv, diffs }
 */
export function tailorCvHeuristic(originalCv, jobDescription) {
  const { allKeywords, hardSkills, targetRole, targetCompany } =
    extractJdKeywords(jobDescription);

  // Clone original CV
  const tailoredCv = JSON.parse(JSON.stringify(originalCv));
  const diffs = [];

  // 1. Tailor Job Title in Personal Info
  if (targetRole && targetRole !== "Target Role") {
    const oldTitle = tailoredCv.personalInfo.jobTitle;
    tailoredCv.personalInfo.jobTitle = targetRole;
    diffs.push({
      section: "Professional Title",
      type: "title",
      original: oldTitle,
      tailored: targetRole,
      reason: `Aligned title to target opening (${targetRole}) to pass initial ATS title matching.`,
    });
  }

  // 2. Tailor Professional Summary
  const topSkills = hardSkills.slice(0, 5).join(", ");
  const oldSummary = tailoredCv.summary;
  const newSummary = `Dynamic and impact-driven ${tailoredCv.personalInfo.jobTitle || "Engineer"} with extensive expertise across ${topSkills || "modern full-stack architecture"}. Demonstrated history of architecting resilient distributed systems, driving engineering throughput, and partnering with product teams at organizations like ${targetCompany || "leading tech companies"}. Dedicated to building scalable, high-availability solutions that exceed ATS benchmarks and business goals.`;

  tailoredCv.summary = newSummary;
  diffs.push({
    section: "Professional Summary",
    type: "summary",
    original: oldSummary,
    tailored: newSummary,
    reason: `Targeted summary directly to ${targetRole} position, incorporating core JD requirements (${topSkills}).`,
  });

  // 3. Inject Missing Hard Skills into Skills Section
  const existingSkillsLower = (tailoredCv.skills || []).map((s) =>
    s.toLowerCase(),
  );
  const skillsToAdd = hardSkills
    .filter(
      (s) => !existingSkillsLower.some((es) => es.includes(s.toLowerCase())),
    )
    .slice(0, 8);

  if (skillsToAdd.length > 0) {
    const formattedToAdd = skillsToAdd.map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1),
    );
    tailoredCv.skills = Array.from(
      new Set([...formattedToAdd, ...(tailoredCv.skills || [])]),
    );
    diffs.push({
      section: "Skills Inventory",
      type: "skills",
      original: (originalCv.skills || []).join(", "),
      tailored: tailoredCv.skills.join(", "),
      reason: `Prioritized missing high-value ATS keywords: ${formattedToAdd.join(", ")}.`,
    });
  }

  // 4. Enhance Experience Bullets with STAR / XYZ Formula & JD Keywords
  const unusedKeywords = [...hardSkills.slice(0, 6)];

  if (Array.isArray(tailoredCv.experience)) {
    tailoredCv.experience.forEach((exp, expIdx) => {
      if (!Array.isArray(exp.bullets)) return;

      exp.bullets = exp.bullets.map((bullet, bulletIdx) => {
        let enhancedBullet = bullet;
        let modified = false;

        // If bullet lacks numbers/metrics, inject a realistic impact metric
        if (!/\d+[%$kKmM]|\b\d+\b/.test(bullet)) {
          enhancedBullet = `${bullet.replace(/\.$/, "")}, resulting in a 28% increase in system efficiency and reduced operational latency.`;
          modified = true;
        }

        // Weave in a relevant JD keyword if available
        if (unusedKeywords.length > 0 && bulletIdx % 2 === 0) {
          const kw = unusedKeywords.shift();
          const cleanKw = kw.charAt(0).toUpperCase() + kw.slice(1);
          if (!enhancedBullet.toLowerCase().includes(kw.toLowerCase())) {
            enhancedBullet = enhancedBullet.replace(
              /^(Architected|Led|Developed|Engineered|Built|Designed|Implemented|Refactored)/i,
              `Leveraged ${cleanKw} and best practices to $1`,
            );
            if (!enhancedBullet.toLowerCase().includes(kw.toLowerCase())) {
              enhancedBullet = `${enhancedBullet.replace(/\.$/, "")} utilizing ${cleanKw} and enterprise design patterns.`;
            }
            modified = true;
          }
        }

        if (modified) {
          diffs.push({
            section: `${exp.company} (${exp.role})`,
            type: "bullet",
            original: bullet,
            tailored: enhancedBullet,
            reason:
              "Enriched with STAR/XYZ quantifiable impact and integrated target job keyword.",
          });
        }

        return enhancedBullet;
      });
    });
  }

  return {
    tailoredCv,
    diffs,
    engine: "Smart ATS Heuristic Engine",
  };
}

/**
 * Tailor CV using Google Gemini API or Fallback
 * @param {object} originalCv
 * @param {string} jobDescription
 * @param {string} customApiKey
 * @returns {Promise<{ tailoredCv: object, diffs: Array, engine: string }>}
 */
export async function tailorCvWithGemini(
  originalCv,
  jobDescription,
  customApiKey = "",
) {
  const apiKey = customApiKey || getStoredApiKey();

  // If no API key supplied, gracefully run our rich smart heuristic engine
  if (!apiKey) {
    return tailorCvHeuristic(originalCv, jobDescription);
  }

  const prompt = `
You are an expert ATS (Applicant Tracking System) CV Optimization and Resume Rewriter specialist.
Your mission is to tailor the candidate's CV to maximize their ATS match score for the provided Job Description (JD).

CRITICAL ATS GUIDELINES:
1. Incorporate required technical skills, tools, and methodologies from the JD naturally without keyword stuffing or fabricating unrealistic credentials.
2. Rewrite bullet points using Google's XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") with quantifiable business outcomes.
3. Optimize the Professional Summary to directly speak to the target job title, company needs, and key qualifications.
4. Align the candidate's job title with the target role where reasonable.
5. Reorder and categorize skills to place the most critical JD skills at the top.

ORIGINAL CV (JSON):
${JSON.stringify(originalCv, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT:
You MUST respond with valid JSON ONLY, conforming exactly to this structure (no markdown fences, no explanatory text outside the JSON):
{
  "tailoredCv": {
    "personalInfo": {
      "fullName": string,
      "jobTitle": string,
      "email": string,
      "phone": string,
      "location": string,
      "website": string,
      "linkedin": string,
      "github": string
    },
    "summary": string,
    "skills": string[],
    "experience": [
      {
        "id": string,
        "role": string,
        "company": string,
        "location": string,
        "startDate": string,
        "endDate": string,
        "current": boolean,
        "bullets": string[]
      }
    ],
    "education": [
      {
        "id": string,
        "degree": string,
        "institution": string,
        "location": string,
        "graduationYear": string,
        "honors": string
      }
    ],
    "certifications": string[],
    "projects": [
      {
        "id": string,
        "name": string,
        "technologies": string,
        "description": string
      }
    ]
  },
  "diffs": [
    {
      "section": string,
      "type": "summary" | "bullet" | "skills" | "title",
      "original": string,
      "tailored": string,
      "reason": string
    }
  ]
}
`;

  try {
    // Call Gemini API (gemini-2.5-flash or gemini-1.5-flash)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(
        "Gemini API call returned non-200, falling back to heuristic engine:",
        errBody,
      );
      return tailorCvHeuristic(originalCv, jobDescription);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("No content returned from Gemini model");
    }

    // Clean any backticks if returned
    const cleaned = candidateText
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      tailoredCv: parsed.tailoredCv || originalCv,
      diffs: parsed.diffs || [],
      engine: "Google Gemini 2.5 Flash",
    };
  } catch (error) {
    console.error(
      "Gemini API processing failed, using smart heuristic engine fallback:",
      error,
    );
    return tailorCvHeuristic(originalCv, jobDescription);
  }
}
