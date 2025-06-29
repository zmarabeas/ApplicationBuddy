import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import multer from 'multer';
import { Request } from 'express';
import { parseResumeWithAI } from './openai.js';

// We'll import these dynamically to avoid initialization issues
let pdfjsLib: any;
let mammoth: any;

// Try to import the modules at runtime using dynamic import
(async () => {
  try {
    // Using dynamic imports for ES modules
    const pdfjsModule = await import('pdfjs-dist');
    const mammothModule = await import('mammoth');
    
    pdfjsLib = pdfjsModule;
    mammoth = mammothModule.default;
    console.log('Document parser modules loaded successfully');
  } catch (err) {
    console.error('Error loading document parser modules:', err);
    // Don't throw - we'll handle this gracefully when processing files
  }
})();

// Function to ensure modules are loaded before use
async function ensureModulesLoaded() {
  if (!pdfjsLib || !mammoth) {
    try {
      const pdfjsModule = await import('pdfjs-dist');
      const mammothModule = await import('mammoth');
      
      pdfjsLib = pdfjsModule;
      mammoth = mammothModule.default;
    } catch (err) {
      console.error('Failed to load document parser modules:', err);
      throw new Error('Document parser modules not available');
    }
  }
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(os.tmpdir(), 'applicationbuddy-uploads');
    fs.mkdir(tempDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating temp directory:', err);
      }
      cb(null, tempDir);
    });
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid collisions
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExt}`);
  }
});

// File filter to only allow PDF and DOCX
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed!'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

/**
 * Extract text from a PDF file
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    await ensureModulesLoaded();
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfjsLib.getDocument(dataBuffer).promise;
    let text = '';
    for (let i = 1; i <= data.numPages; i++) {
      const page = await data.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item: any) => item.str).join('\n');
    }
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from a DOCX file
 */
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    await ensureModulesLoaded();
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Process a resume file and extract information
 */
export async function processResumeFile(filePath: string, fileType: string) {
  try {
    let text = '';
    
    // Extract text based on file type
    if (fileType === 'pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (fileType === 'docx') {
      text = await extractTextFromDOCX(filePath);
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Ensure we got text content
    if (!text || text.trim() === '') {
      throw new Error('No text content found in the file');
    }
    
    // Parse the resume text with AI
    const parsedData = await parseResumeWithAI(text);
    
    // Clean up the temp file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
      // Continue even if file deletion fails
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error processing resume file:', error);
    
    // Attempt to clean up the temp file even on error
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }
    
    throw error;
  }
}