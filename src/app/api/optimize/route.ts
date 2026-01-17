import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume optimizer. Your role is to help candidates tailor their existing resume to better match a specific job description.

## CRITICAL RULES:
1. **NEVER fabricate or invent** experiences, skills, or qualifications the candidate doesn't have
2. **ONLY reorganize, rephrase, and highlight** existing information
3. **Use keywords** from the job description naturally within existing experiences
4. **Quantify achievements** where possible using existing data
5. **Maintain truthfulness** - if a skill is missing, suggest adding it to a "Currently Learning" section

## YOUR TASKS:
1. Analyze the job description to extract required skills and keywords
2. Review the resume and identify matching skills and gaps
3. Optimize the resume by rephrasing to include keywords naturally

## OUTPUT FORMAT:
Return a valid JSON object with this EXACT structure:
{
  "matchScore": <number 0-100>,
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword3", "keyword4"],
  "suggestions": [
    {
      "section": "Experience",
      "original": "Original text from resume",
      "improved": "Improved text with keywords",
      "reason": "Added relevant keywords"
    }
  ],
  "optimizedSections": {
    "summary": "Optimized professional summary",
    "experience": ["Bullet point 1", "Bullet point 2"],
    "skills": ["Skill 1", "Skill 2"],
    "education": ["Education entry"]
  },
  "warnings": ["Any concerns about gaps"],
  "learningRecommendations": ["Skills to develop"]
}`;

export async function POST(request: NextRequest) {
    try {
        const { resumeText, jobDescription } = await request.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Resume text and job description are required' },
                { status: 400 }
            );
        }

        // Check for API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured. Please add GEMINI_API_KEY to environment variables.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
            }
        });

        const prompt = `${SYSTEM_PROMPT}

---
RESUME:
${resumeText}

---
JOB DESCRIPTION:
${jobDescription}

---
Analyze the resume against the job description and provide optimization suggestions. Return ONLY valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse the JSON response
        const analysis = JSON.parse(response);

        return NextResponse.json(analysis);
    } catch (error: unknown) {
        console.error('Optimization error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Rate limit error
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait 30-60 seconds and try again.' },
                { status: 429 }
            );
        }

        // API key error
        if (errorMessage.includes('API_KEY') || errorMessage.includes('401') || errorMessage.includes('403')) {
            return NextResponse.json(
                { error: 'Invalid API key. Please check your GEMINI_API_KEY.' },
                { status: 401 }
            );
        }

        // Model not found
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            return NextResponse.json(
                { error: 'AI model not available. Please try again later.' },
                { status: 503 }
            );
        }

        // Generic error
        return NextResponse.json(
            { error: `API Error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
