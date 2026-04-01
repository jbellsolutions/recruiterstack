/**
 * Resume Text Extraction — PDF, DOCX, and plain text
 */

import { readFileSync, existsSync } from 'fs';

export async function extractText(filePath: string): Promise<string> {
  if (!existsSync(filePath)) {
    return `[File not found: ${filePath}]`;
  }

  const ext = filePath.toLowerCase().split('.').pop();

  if (ext === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const buffer = readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } catch (e) {
      return `[PDF extraction failed: ${e instanceof Error ? e.message : 'unknown error'}]`;
    }
  }

  if (ext === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (e) {
      return `[DOCX extraction failed: ${e instanceof Error ? e.message : 'unknown error'}]`;
    }
  }

  if (ext === 'txt' || ext === 'md') {
    return readFileSync(filePath, 'utf-8');
  }

  return `[Unsupported file type: ${ext}]`;
}

export function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift',
    'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Django', 'FastAPI', 'Spring Boot', 'Express',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL', 'NoSQL', 'GraphQL', 'REST APIs',
    'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'NLP',
    'Agile', 'Scrum', 'Team Leadership', 'Project Management', 'Product Management',
    'RN', 'LPN', 'CNA', 'BSN', 'MSN', 'NP', 'CRNA', 'BLS', 'ACLS', 'PALS',
    'Forklift', 'OSHA', 'CDL', 'Welding', 'CNC', 'Six Sigma', 'Lean Manufacturing'
  ];
  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => textLower.includes(skill.toLowerCase()));
}
