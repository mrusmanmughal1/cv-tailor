// Common Tech & Professional Keywords Dictionary for Enhanced Heuristic Extraction
const COMMON_TECH_KEYWORDS = [
  'react', 'react.js', 'typescript', 'javascript', 'node.js', 'nodejs', 'next.js', 'vue', 'angular',
  'python', 'java', 'c++', 'c#', '.net', 'golang', 'go', 'rust', 'ruby', 'rails', 'php',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ci/cd', 'github actions',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest', 'restful',
  'microservices', 'distributed systems', 'system design', 'serverless', 'lambda', 'kafka', 'rabbitmq',
  'agile', 'scrum', 'kanban', 'jira', 'jest', 'cypress', 'unit testing', 'integration testing',
  'tailwind', 'css3', 'html5', 'webpack', 'vite', 'git', 'linux', 'datadog', 'cloudwatch',
  'sql', 'nosql', 'api design', 'devops', 'scalability', 'performance optimization', 'cross-functional'
];

const SOFT_SKILLS = [
  'leadership', 'mentoring', 'communication', 'collaboration', 'problem solving',
  'analytical skills', 'strategic thinking', 'adaptability', 'project management',
  'stakeholder management', 'ownership', 'time management', 'teamwork'
];

/**
 * Extracts normalized tokens and phrases from text
 */
function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Extracts key skills and requirements from a Job Description
 * @param {string} jobDescription
 * @returns {object}
 */
export function extractJdKeywords(jobDescription) {
  if (!jobDescription) {
    return {
      allKeywords: [],
      hardSkills: [],
      softSkills: [],
      targetRole: 'Target Role',
      targetCompany: 'Company'
    };
  }

  const jdLower = jobDescription.toLowerCase();

  // Detect probable job title and company
  const titleMatch = jobDescription.match(/(?:title|role|position|seeking a|looking for a|for a)\s*[:\s-]?\s*([A-Za-z0-9\s/–-]{4,45})/i);
  const companyMatch = jobDescription.match(/(?:company|at|with|join)\s*[:\s-]?\s*([A-Za-z0-9\s.&]{2,35}(?:Inc|LLC|Corporation|Systems|Technologies|Labs|Group|Co)?)/i);

  const targetRole = titleMatch ? titleMatch[1].trim() : 'Senior Engineer';
  const targetCompany = companyMatch ? companyMatch[1].trim() : 'Hiring Organization';

  // Hard skills matching
  const matchedHard = COMMON_TECH_KEYWORDS.filter(keyword => {
    // Regex word boundary matching
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return regex.test(jdLower);
  });

  // Soft skills matching
  const matchedSoft = SOFT_SKILLS.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return regex.test(jdLower);
  });

  // Extract other uppercase or capitalized tech terms (e.g. CI/CD, SaaS, B2B, AI/ML)
  const acronyms = Array.from(new Set(
    (jobDescription.match(/\b[A-Z]{2,6}(?:\/[A-Z]{2,6})?\b/g) || [])
      .filter(w => !['THE', 'AND', 'FOR', 'YOU', 'WITH', 'OUR', 'ARE', 'WILL', 'ALL', 'NOT', 'BUT'].includes(w))
  ));

  const allKeywords = Array.from(new Set([...matchedHard, ...matchedSoft, ...acronyms.map(a => a.toLowerCase())]));

  return {
    allKeywords,
    hardSkills: Array.from(new Set([...matchedHard, ...acronyms])),
    softSkills: matchedSoft,
    targetRole,
    targetCompany
  };
}

/**
 * Calculates ATS score, matched keywords, missing keywords, and formatting metrics
 * @param {object} cv
 * @param {string} jobDescription
 * @returns {object} ATS analysis report
 */
export function analyzeAtsScore(cv, jobDescription) {
  if (!jobDescription || !cv) {
    return {
      overallScore: 0,
      keywordMatchRate: 0,
      impactScore: 0,
      formattingScore: 100,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywordsCount: 0,
      matchedCount: 0,
      metricsFoundCount: 0,
      totalBulletsCount: 0,
      checks: []
    };
  }

  const { allKeywords, hardSkills } = extractJdKeywords(jobDescription);

  // Combine all searchable text in CV
  const cvTokens = [];
  if (cv.personalInfo) {
    cvTokens.push(cv.personalInfo.fullName, cv.personalInfo.jobTitle);
  }
  if (cv.summary) cvTokens.push(cv.summary);
  if (Array.isArray(cv.skills)) cvTokens.push(...cv.skills);
  if (Array.isArray(cv.certifications)) cvTokens.push(...cv.certifications);

  let totalBulletsCount = 0;
  let metricsFoundCount = 0;
  const metricRegex = /\b(?:\d+[%kKmMbB]?|\$\d+|\d+\+|\d+x|\d+\s*(?:percent|users|clients|transactions|ms|seconds|days|weeks|months|years))\b/i;

  if (Array.isArray(cv.experience)) {
    cv.experience.forEach(exp => {
      cvTokens.push(exp.role, exp.company);
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach(b => {
          totalBulletsCount++;
          cvTokens.push(b);
          if (metricRegex.test(b)) {
            metricsFoundCount++;
          }
        });
      }
    });
  }

  if (Array.isArray(cv.projects)) {
    cv.projects.forEach(p => {
      cvTokens.push(p.name, p.technologies, p.description);
    });
  }

  const fullCvText = cvTokens.join(' ').toLowerCase();

  // Check matching
  const matchedKeywords = [];
  const missingKeywords = [];

  const candidateKeywords = allKeywords.length > 0 ? allKeywords : COMMON_TECH_KEYWORDS.slice(0, 15);

  candidateKeywords.forEach(kw => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    
    // Count occurrences
    const occurrences = (fullCvText.match(new RegExp(escaped, 'gi')) || []).length;
    
    if (regex.test(fullCvText) || occurrences > 0) {
      matchedKeywords.push({ keyword: kw, count: occurrences || 1 });
    } else {
      missingKeywords.push(kw);
    }
  });

  // Calculate Sub-scores
  const totalKeywords = candidateKeywords.length || 1;
  const keywordMatchRate = Math.min(100, Math.round((matchedKeywords.length / totalKeywords) * 100));
  
  const impactScore = totalBulletsCount > 0 
    ? Math.min(100, Math.round((metricsFoundCount / totalBulletsCount) * 100))
    : 50;

  // Formatting & ATS Hygiene Checks
  const checks = [];
  let formattingPoints = 100;

  // 1. Email & Contact info
  const hasEmail = cv.personalInfo && cv.personalInfo.email && cv.personalInfo.email.includes('@');
  checks.push({
    title: 'Contact Email Present',
    passed: hasEmail,
    tip: hasEmail ? 'Direct candidate email detected.' : 'ATS requires a valid email for automated candidate profiling.'
  });
  if (!hasEmail) formattingPoints -= 20;

  // 2. Phone number
  const hasPhone = cv.personalInfo && cv.personalInfo.phone && cv.personalInfo.phone.length > 6;
  checks.push({
    title: 'Phone Number Present',
    passed: hasPhone,
    tip: hasPhone ? 'Contact number formatted correctly.' : 'Add your phone number with country/area code.'
  });
  if (!hasPhone) formattingPoints -= 15;

  // 3. Professional Summary
  const hasSummary = cv.summary && cv.summary.length > 40;
  checks.push({
    title: 'Professional Summary',
    passed: hasSummary,
    tip: hasSummary ? 'Concise summary hooks the recruiter and ATS parser.' : 'Add a 2-4 sentence tailored summary at the top.'
  });
  if (!hasSummary) formattingPoints -= 15;

  // 4. Quantifiable Metrics (STAR / XYZ)
  const hasGoodMetrics = impactScore >= 50;
  checks.push({
    title: 'Measurable Impact (Numbers & %)',
    passed: hasGoodMetrics,
    tip: hasGoodMetrics ? `${metricsFoundCount} of ${totalBulletsCount} bullet points feature measurable outcomes.` : 'Enhance bullets with metrics (e.g., "improved performance by 35%", "managed 5 engineers").'
  });
  if (!hasGoodMetrics) formattingPoints -= 15;

  // 5. Skills Section Depth
  const hasSufficientSkills = cv.skills && cv.skills.length >= 6;
  checks.push({
    title: 'Dedicated Skills Section',
    passed: hasSufficientSkills,
    tip: hasSufficientSkills ? `${cv.skills.length} skills listed in an ATS-scannable format.` : 'Include at least 6-12 relevant skills directly matching the job description.'
  });
  if (!hasSufficientSkills) formattingPoints -= 15;

  // 6. Work Experience Structure
  const hasExperience = Array.isArray(cv.experience) && cv.experience.length > 0;
  checks.push({
    title: 'Chronological Work History',
    passed: hasExperience,
    tip: hasExperience ? 'Standard chronological experience layout detected.' : 'Add your work history with company, title, dates, and bulleted responsibilities.'
  });
  if (!hasExperience) formattingPoints -= 20;

  const formattingScore = Math.max(20, formattingPoints);

  // Overall ATS Weighted Score: 55% Keywords, 25% Impact, 20% Formatting
  const overallScore = Math.round(
    (keywordMatchRate * 0.55) + 
    (impactScore * 0.25) + 
    (formattingScore * 0.20)
  );

  return {
    overallScore: Math.max(10, Math.min(99, overallScore)),
    keywordMatchRate,
    impactScore,
    formattingScore,
    matchedKeywords,
    missingKeywords,
    totalKeywordsCount: totalKeywords,
    matchedCount: matchedKeywords.length,
    metricsFoundCount,
    totalBulletsCount,
    checks
  };
}
