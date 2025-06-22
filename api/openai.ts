import OpenAI from "openai";
import { PersonalInfo } from "./schema.js";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedResumeData {
  personalInfo: PersonalInfo;
  workExperiences: Array<{
    company: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  educations: Array<{
    institution: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  skills: string[];
}

/**
 * Parse resume text using OpenAI
 */
export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    const prompt = `
    You are a professional resume parser. Extract structured information from the following resume content.
    Return the data in JSON format with the following structure:
    {
      "personalInfo": {
        "firstName": string,
        "lastName": string,
        "email": string,
        "phone": string (optional),
        "address": {
          "street": string (optional),
          "city": string (optional),
          "state": string (optional),
          "zip": string (optional),
          "country": string (optional)
        },
        "links": {
          "linkedin": string (optional),
          "github": string (optional),
          "portfolio": string (optional)
        }
      },
      "workExperiences": [
        {
          "company": string,
          "title": string,
          "location": string (optional),
          "startDate": string (in YYYY-MM format),
          "endDate": string (in YYYY-MM format, leave empty if current),
          "current": boolean,
          "description": string (optional)
        }
      ],
      "educations": [
        {
          "institution": string,
          "degree": string (optional),
          "field": string (optional),
          "startDate": string (in YYYY-MM format),
          "endDate": string (in YYYY-MM format, leave empty if current),
          "current": boolean,
          "description": string (optional)
        }
      ],
      "skills": string[] (array of individual skills)
    }

    Important guidelines:
    - If a date is ambiguous or just a year, use the format YYYY-01 for January of that year
    - For current positions, set "current" to true and leave endDate empty
    - For skills, extract individual technical skills, soft skills, tools, languages, etc. as separate items in the array
    - Only include fields if you find them in the resume, don't make up data
    - Be sure to extract both technical skills and soft skills
    - For work experiences, include specific achievements and responsibilities in the description
    
    Resume content:
    ${resumeText}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get content from OpenAI response");
    }

    const parsedData = JSON.parse(content) as ParsedResumeData;
    return parsedData;
  } catch (error) {
    console.error("Error parsing resume with OpenAI:", error);
    throw new Error("Failed to parse resume with AI");
  }
}