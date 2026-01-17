import { NextRequest, NextResponse } from 'next/server';

// Simple PDF text extraction (for demo purposes)
// In production, use pdf-parse package
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

        // For demo: Extract text using a simple approach
        // In production, install pdf-parse: npm install pdf-parse
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Try to use pdf-parse if available
        let text = '';
        try {
            // Dynamic import to handle if pdf-parse is not installed
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(buffer);
            text = data.text;
        } catch {
            // Fallback: basic text extraction from PDF buffer
            // This is a simplified approach - real implementation needs pdf-parse
            const textContent = buffer.toString('utf-8');
            // Try to find readable text in the PDF
            const matches = textContent.match(/\/([A-Za-z\s,.\-@0-9]+)/g);
            if (matches) {
                text = matches.join(' ').replace(/\//g, '').substring(0, 5000);
            }

            // If no text found, return a message to install pdf-parse
            if (!text || text.length < 50) {
                return NextResponse.json({
                    text: `[PDF text extraction requires pdf-parse package]
          
Please install it by running: npm install pdf-parse

For now, you can paste your resume text manually.

File received: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
                    pages: 1,
                    info: { title: file.name }
                });
            }
        }

        return NextResponse.json({
            text,
            pages: 1,
            info: { title: file.name }
        });
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to parse PDF. Try installing pdf-parse: npm install pdf-parse' },
            { status: 500 }
        );
    }
}
