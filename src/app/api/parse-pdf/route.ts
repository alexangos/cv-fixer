import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Only PDF files are accepted' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // For this demo version, we'll ask users to paste text manually
        // PDF parsing requires additional server configuration
        // In production, you would use a service like pdf.js or a cloud function

        return NextResponse.json({
            text: `[PDF uploaded: ${file.name}]

To use this app, please paste your resume text directly into this field.

Why? PDF parsing in serverless environments (like Vercel) requires special configuration. For the best experience, copy and paste your resume text from your PDF.

Tip: Open your PDF, press Ctrl+A to select all, then Ctrl+C to copy.`,
            pages: 1,
            info: { title: file.name },
            requiresManualInput: true
        });
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to process file. Please paste your resume text manually.' },
            { status: 500 }
        );
    }
}
