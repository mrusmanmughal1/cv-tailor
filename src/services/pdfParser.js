import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker using unpkg / cdnjs fallback or bundled worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Extract plain text from an uploaded PDF file
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY = null;
      let pageText = '';
      
      for (const item of textContent.items) {
        if ('str' in item) {
          // If vertical position changed substantially, add newline
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
      }
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF file. Ensure it is a valid document with selectable text.');
  }
}

/**
 * Parse raw CV text into structured format
 * @param {string} rawText
 * @returns {object} structured CV object
 */
export function parseRawCvText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract email, phone, links
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const websiteMatch = rawText.match(/(?:https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/);

  // Fallback name is typically the first non-empty line
  const probableName = lines[0] && lines[0].length < 40 ? lines[0] : 'Your Name';
  const probableTitle = lines[1] && lines[1].length < 60 && !lines[1].includes('@') ? lines[1] : 'Professional Title';

  // Identify section headers
  const sectionHeaders = [
    { key: 'summary', regex: /^(?:professional\s+summary|summary|profile|about\s+me|objective)/i },
    { key: 'experience', regex: /^(?:work\s+experience|experience|employment|work\s+history|professional\s+experience)/i },
    { key: 'skills', regex: /^(?:skills|technical\s+skills|core\s+competencies|technologies|expertise)/i },
    { key: 'education', regex: /^(?:education|academic\s+background|degrees)/i },
    { key: 'projects', regex: /^(?:projects|personal\s+projects|notable\s+projects)/i },
    { key: 'certifications', regex: /^(?:certifications|licenses|credentials)/i }
  ];

  const sections = {
    summary: '',
    experience: [],
    skills: [],
    education: [],
    projects: [],
    certifications: []
  };

  let currentSection = null;
  const sectionBuffers = {
    summary: [],
    experience: [],
    skills: [],
    education: [],
    projects: [],
    certifications: []
  };

  for (const line of lines) {
    const matchedHeader = sectionHeaders.find(h => h.regex.test(line));
    if (matchedHeader) {
      currentSection = matchedHeader.key;
      continue;
    }

    if (currentSection && sectionBuffers[currentSection]) {
      sectionBuffers[currentSection].push(line);
    }
  }

  // Process Summary
  if (sectionBuffers.summary.length > 0) {
    sections.summary = sectionBuffers.summary.join(' ');
  } else {
    // If no explicit summary header found, check early paragraphs
    const potentialSummary = lines.slice(2, 6).filter(l => l.length > 40 && !l.includes('@')).join(' ');
    if (potentialSummary) sections.summary = potentialSummary;
  }

  // Process Skills
  if (sectionBuffers.skills.length > 0) {
    const rawSkillsText = sectionBuffers.skills.join(', ');
    const extractedSkills = rawSkillsText
      .split(/[,•|·\n\t]+/)
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(s => s.length > 1 && s.length < 35 && !s.toLowerCase().includes('skills:'));
    sections.skills = Array.from(new Set(extractedSkills));
  }

  // Process Experience
  if (sectionBuffers.experience.length > 0) {
    const expLines = sectionBuffers.experience;
    let currentRole = null;
    let roleBullets = [];

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const isBullet = /^[•\-*▪]/.test(line) || (line.length > 25 && /^[A-Z]/.test(line) && line.endsWith('.'));
      
      if (!isBullet && (line.includes(' - ') || line.includes(' | ') || line.length < 50)) {
        // Probable company/role header
        if (currentRole) {
          sections.experience.push({
            id: `exp-${sections.experience.length + 1}`,
            role: currentRole.role || 'Role',
            company: currentRole.company || 'Company',
            location: currentRole.location || '',
            startDate: currentRole.startDate || '2020',
            endDate: currentRole.endDate || 'Present',
            current: currentRole.endDate === 'Present',
            bullets: roleBullets.length > 0 ? roleBullets : ['Contributed to key initiatives and team objectives.']
          });
          roleBullets = [];
        }

        const parts = line.split(/[|–—-]/).map(p => p.trim());
        currentRole = {
          role: parts[0] || 'Software Engineer',
          company: parts[1] || 'Company Inc',
          location: '',
          startDate: '2021',
          endDate: 'Present'
        };
      } else {
        const cleanBullet = line.replace(/^[•\-*▪]\s*/, '').trim();
        if (cleanBullet.length > 5) {
          roleBullets.push(cleanBullet);
        }
      }
    }

    if (currentRole) {
      sections.experience.push({
        id: `exp-${sections.experience.length + 1}`,
        role: currentRole.role || 'Role',
        company: currentRole.company || 'Company',
        location: currentRole.location || '',
        startDate: currentRole.startDate || '2020',
        endDate: currentRole.endDate || 'Present',
        current: currentRole.endDate === 'Present',
        bullets: roleBullets.length > 0 ? roleBullets : ['Delivered business-critical software solutions.']
      });
    }
  }

  // Process Education
  if (sectionBuffers.education.length > 0) {
    const eduText = sectionBuffers.education.join(' ');
    sections.education.push({
      id: 'edu-1',
      degree: sectionBuffers.education[0] || 'Bachelor of Science',
      institution: sectionBuffers.education[1] || 'University',
      location: '',
      graduationYear: (eduText.match(/20\d{2}|19\d{2}/) || ['2020'])[0],
      honors: ''
    });
  }

  return {
    personalInfo: {
      fullName: probableName,
      jobTitle: probableTitle,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      website: websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github') ? websiteMatch[0] : '',
      linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '',
      github: githubMatch ? `github.com/${githubMatch[1]}` : ''
    },
    summary: sections.summary || 'Experienced professional with a demonstrated history of delivering high-impact solutions.',
    skills: sections.skills.length > 0 ? sections.skills : ['Problem Solving', 'Team Collaboration', 'Communication'],
    experience: sections.experience.length > 0 ? sections.experience : [],
    education: sections.education.length > 0 ? sections.education : [],
    certifications: sections.certifications || [],
    projects: []
  };
}
