import type {
  ATSAdapter,
  Candidate,
  CandidateFilter,
  Credential,
  JobOrder,
  JobOrderFilter,
  Placement,
  ScreeningResult,
  Submission,
} from './types.js';

// Helper to compute date strings relative to today
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = daysFromNow(0);

// ---------------------------------------------------------------------------
// Sample Candidates (15 total)
// ---------------------------------------------------------------------------

const CANDIDATES: Candidate[] = [
  // ── IT Vertical (5) ─────────────────────────────────────────────────────
  {
    id: 'C-1001',
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'marcus.chen@email.com',
    phone: '(512) 555-0147',
    skills: ['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'PostgreSQL', 'CI/CD', 'Microservices'],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Rackspace Technology',
        startDate: '2021-03-01',
        current: true,
        description: 'Lead backend services team building cloud-native Java microservices on AWS EKS. Migrated monolith to 12 microservices serving 2M requests/day.',
      },
      {
        title: 'Software Engineer',
        company: 'Dell Technologies',
        startDate: '2017-06-15',
        endDate: '2021-02-28',
        current: false,
        description: 'Developed RESTful APIs and Spring Boot services for enterprise storage management platform.',
      },
    ],
    education: [{ degree: 'BS', field: 'Computer Science', institution: 'UT Austin', graduationDate: '2017-05-15' }],
    location: { city: 'Austin', state: 'TX', zip: '78701' },
    source: 'LinkedIn',
    status: 'active',
    lastContactDate: daysFromNow(-3),
    resumeText: 'Senior backend engineer with 7+ years Java/Spring Boot experience. AWS certified. Strong in microservices architecture and Kubernetes orchestration.',
    notes: 'Open to remote. Looking for $160K+ base or $85/hr contract.',
  },
  {
    id: 'C-1002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '(408) 555-0293',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Next.js', 'Tailwind CSS', 'AWS Lambda'],
    experience: [
      {
        title: 'Full Stack Developer',
        company: 'Salesforce',
        startDate: '2020-01-10',
        current: true,
        description: 'Build and maintain customer-facing React/TypeScript applications. Led migration from REST to GraphQL reducing API calls by 40%.',
      },
      {
        title: 'Frontend Developer',
        company: 'Atlassian',
        startDate: '2018-07-01',
        endDate: '2019-12-20',
        current: false,
        description: 'Developed React components for Jira Cloud. Contributed to design system used across 5 product teams.',
      },
    ],
    education: [{ degree: 'MS', field: 'Computer Science', institution: 'Stanford University', graduationDate: '2018-06-10' }],
    location: { city: 'San Jose', state: 'CA', zip: '95112' },
    source: 'Referral',
    status: 'active',
    lastContactDate: daysFromNow(-7),
    resumeText: 'Full stack engineer specializing in React, TypeScript, and Node.js. 6 years experience building scalable web applications.',
  },
  {
    id: 'C-1003',
    firstName: 'David',
    lastName: 'Kowalski',
    email: 'david.kowalski@email.com',
    phone: '(312) 555-0481',
    skills: ['Python', 'Azure', 'DevOps', 'Terraform', 'Docker', 'Jenkins', 'Ansible', 'Linux'],
    experience: [
      {
        title: 'DevOps Engineer',
        company: 'Motorola Solutions',
        startDate: '2019-09-01',
        current: true,
        description: 'Manage CI/CD pipelines and Azure infrastructure for mission-critical public safety platform. Reduced deployment time from 4 hours to 15 minutes.',
      },
      {
        title: 'Systems Administrator',
        company: 'Allstate Insurance',
        startDate: '2016-03-15',
        endDate: '2019-08-31',
        current: false,
        description: 'Administered 200+ Linux servers. Automated provisioning with Ansible reducing setup time by 80%.',
      },
    ],
    education: [{ degree: 'BS', field: 'Information Technology', institution: 'DePaul University', graduationDate: '2016-05-20' }],
    location: { city: 'Chicago', state: 'IL', zip: '60601' },
    source: 'Job Board',
    status: 'active',
    lastContactDate: daysFromNow(-14),
    resumeText: 'DevOps engineer with 8 years experience in cloud infrastructure, CI/CD, and infrastructure-as-code. Azure and AWS certified.',
  },
  {
    id: 'C-1004',
    firstName: 'Aisha',
    lastName: 'Robinson',
    email: 'aisha.robinson@email.com',
    phone: '(404) 555-0672',
    skills: ['Cybersecurity', 'SIEM', 'Splunk', 'Incident Response', 'CompTIA Security+', 'Penetration Testing', 'Python'],
    experience: [
      {
        title: 'Security Analyst',
        company: 'Home Depot',
        startDate: '2020-06-01',
        current: true,
        description: 'Monitor SIEM alerts, lead incident response for retail environment processing $150B in annual transactions. Reduced mean-time-to-detect by 60%.',
      },
      {
        title: 'Junior Security Analyst',
        company: 'Equifax',
        startDate: '2018-08-15',
        endDate: '2020-05-30',
        current: false,
        description: 'Performed vulnerability assessments and penetration testing on consumer-facing applications.',
      },
    ],
    education: [{ degree: 'BS', field: 'Cybersecurity', institution: 'Georgia Tech', graduationDate: '2018-05-15' }],
    location: { city: 'Atlanta', state: 'GA', zip: '30301' },
    source: 'LinkedIn',
    status: 'active',
    lastContactDate: daysFromNow(-2),
    resumeText: 'Cybersecurity analyst with 6 years experience in threat detection, incident response, and penetration testing. CompTIA Security+ and CEH certified.',
  },
  {
    id: 'C-1005',
    firstName: 'Tyler',
    lastName: 'Nguyen',
    email: 'tyler.nguyen@email.com',
    phone: '(206) 555-0819',
    skills: ['Data Engineering', 'Python', 'Spark', 'Snowflake', 'dbt', 'Airflow', 'SQL', 'Kafka'],
    experience: [
      {
        title: 'Senior Data Engineer',
        company: 'Amazon',
        startDate: '2019-04-01',
        current: true,
        description: 'Design and maintain data pipelines processing 50TB daily using Spark and Kafka. Built real-time analytics platform for supply chain optimization.',
      },
    ],
    education: [{ degree: 'MS', field: 'Data Science', institution: 'University of Washington', graduationDate: '2019-03-15' }],
    location: { city: 'Seattle', state: 'WA', zip: '98101' },
    source: 'Recruiter Sourced',
    status: 'passive',
    lastContactDate: daysFromNow(-30),
    resumeText: 'Data engineer with 5+ years experience building large-scale data pipelines. Expert in Spark, Snowflake, and real-time streaming with Kafka.',
    notes: 'Passive candidate. Happy at Amazon but open to hear about $180K+ opportunities.',
  },

  // ── Healthcare Vertical (4) ─────────────────────────────────────────────
  {
    id: 'C-2001',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '(615) 555-1024',
    skills: ['RN', 'ICU', 'ACLS', 'BLS', 'Ventilator Management', 'Epic EMR', 'Critical Care'],
    experience: [
      {
        title: 'ICU Registered Nurse',
        company: 'Vanderbilt University Medical Center',
        startDate: '2019-01-15',
        current: true,
        description: 'Provide critical care nursing in 30-bed medical ICU. Charge nurse on night shift. Preceptor for new grad nurses.',
      },
      {
        title: 'Staff Nurse - Med/Surg',
        company: 'HCA Healthcare - TriStar Centennial',
        startDate: '2016-06-01',
        endDate: '2019-01-10',
        current: false,
        description: 'Provided direct patient care on 36-bed medical-surgical unit. Transitioned to ICU after obtaining critical care certification.',
      },
    ],
    education: [{ degree: 'BSN', field: 'Nursing', institution: 'Belmont University', graduationDate: '2016-05-10' }],
    location: { city: 'Nashville', state: 'TN', zip: '37203' },
    source: 'Job Board',
    status: 'active',
    lastContactDate: daysFromNow(-5),
    resumeText: 'ICU registered nurse with 8 years experience. ACLS/BLS certified. Epic EMR proficient. Seeking travel nursing assignments.',
    credentials: [
      { id: 'CR-2001-1', candidateId: 'C-2001', type: 'License', name: 'RN License - Tennessee', state: 'TN', issueDate: '2016-06-01', expirationDate: daysFromNow(120), status: 'active', verifiedDate: '2025-01-15' },
      { id: 'CR-2001-2', candidateId: 'C-2001', type: 'Certification', name: 'ACLS', issueDate: '2023-03-01', expirationDate: daysFromNow(45), status: 'expiring-soon', verifiedDate: '2023-03-05' },
      { id: 'CR-2001-3', candidateId: 'C-2001', type: 'Certification', name: 'BLS', issueDate: '2023-09-01', expirationDate: daysFromNow(180), status: 'active', verifiedDate: '2023-09-05' },
    ],
  },
  {
    id: 'C-2002',
    firstName: 'James',
    lastName: 'Okonkwo',
    email: 'james.okonkwo@email.com',
    phone: '(713) 555-2048',
    skills: ['Physical Therapy', 'Orthopedic Rehab', 'Manual Therapy', 'Sports Medicine', 'Patient Assessment'],
    experience: [
      {
        title: 'Physical Therapist',
        company: 'Memorial Hermann Health System',
        startDate: '2018-08-01',
        current: true,
        description: 'Provide outpatient orthopedic physical therapy. Specialize in post-surgical ACL and rotator cuff rehabilitation. Caseload of 14-16 patients/day.',
      },
    ],
    education: [{ degree: 'DPT', field: 'Physical Therapy', institution: 'Texas Womans University', graduationDate: '2018-05-20' }],
    location: { city: 'Houston', state: 'TX', zip: '77030' },
    source: 'Referral',
    status: 'active',
    lastContactDate: daysFromNow(-10),
    resumeText: 'Licensed physical therapist with 6 years outpatient orthopedic experience. DPT degree. Manual therapy specialist.',
    credentials: [
      { id: 'CR-2002-1', candidateId: 'C-2002', type: 'License', name: 'PT License - Texas', state: 'TX', issueDate: '2018-08-01', expirationDate: daysFromNow(15), status: 'expiring-soon', verifiedDate: '2024-02-10' },
      { id: 'CR-2002-2', candidateId: 'C-2002', type: 'Certification', name: 'BLS', issueDate: '2024-01-15', expirationDate: daysFromNow(300), status: 'active', verifiedDate: '2024-01-20' },
    ],
  },
  {
    id: 'C-2003',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    email: 'maria.gonzalez@email.com',
    phone: '(602) 555-3072',
    skills: ['CNA', 'Long-Term Care', 'Dementia Care', 'Vital Signs', 'Patient Hygiene', 'Spanish Bilingual'],
    experience: [
      {
        title: 'Certified Nursing Assistant',
        company: 'Brookdale Senior Living',
        startDate: '2021-04-01',
        current: true,
        description: 'Provide daily living assistance to 12 residents in memory care unit. Bilingual Spanish/English communication with families.',
      },
      {
        title: 'Home Health Aide',
        company: 'Comfort Keepers',
        startDate: '2019-06-01',
        endDate: '2021-03-30',
        current: false,
        description: 'Provided in-home care for elderly clients including meal prep, hygiene assistance, and medication reminders.',
      },
    ],
    education: [{ degree: 'Certificate', field: 'Nursing Assistant', institution: 'Maricopa Community College', graduationDate: '2019-05-01' }],
    location: { city: 'Phoenix', state: 'AZ', zip: '85001' },
    source: 'Job Board',
    status: 'active',
    lastContactDate: daysFromNow(-1),
    resumeText: 'CNA with 5 years experience in long-term care and home health. Bilingual Spanish/English. Specializing in dementia and memory care.',
    credentials: [
      { id: 'CR-2003-1', candidateId: 'C-2003', type: 'Certification', name: 'CNA - Arizona', state: 'AZ', issueDate: '2019-06-01', expirationDate: daysFromNow(-10), status: 'expired' },
      { id: 'CR-2003-2', candidateId: 'C-2003', type: 'Certification', name: 'BLS', issueDate: '2023-06-01', expirationDate: daysFromNow(60), status: 'active', verifiedDate: '2023-06-05' },
    ],
  },
  {
    id: 'C-2004',
    firstName: 'Rachel',
    lastName: 'Kim',
    email: 'rachel.kim@email.com',
    phone: '(503) 555-4096',
    skills: ['RN', 'Labor & Delivery', 'NRP', 'Fetal Monitoring', 'Cerner EMR', 'ACLS', 'BLS'],
    experience: [
      {
        title: 'Labor & Delivery Nurse',
        company: 'OHSU Hospital',
        startDate: '2017-09-01',
        current: true,
        description: 'L&D nurse in high-risk obstetric unit delivering 300+ babies/month. Trained in C-section circulating, fetal monitoring interpretation, and NRP.',
      },
    ],
    education: [{ degree: 'BSN', field: 'Nursing', institution: 'Oregon Health & Science University', graduationDate: '2017-06-15' }],
    location: { city: 'Portland', state: 'OR', zip: '97201' },
    source: 'Recruiter Sourced',
    status: 'active',
    lastContactDate: daysFromNow(-21),
    resumeText: 'L&D registered nurse with 7 years experience in high-risk obstetrics. NRP and ACLS certified. Looking for travel assignments.',
    credentials: [
      { id: 'CR-2004-1', candidateId: 'C-2004', type: 'License', name: 'RN License - Oregon', state: 'OR', issueDate: '2017-09-01', expirationDate: daysFromNow(200), status: 'active', verifiedDate: '2025-01-20' },
      { id: 'CR-2004-2', candidateId: 'C-2004', type: 'Certification', name: 'NRP', issueDate: '2023-07-01', expirationDate: daysFromNow(-5), status: 'expired' },
      { id: 'CR-2004-3', candidateId: 'C-2004', type: 'Certification', name: 'ACLS', issueDate: '2024-01-15', expirationDate: daysFromNow(350), status: 'active', verifiedDate: '2024-01-20' },
      { id: 'CR-2004-4', candidateId: 'C-2004', type: 'Certification', name: 'BLS', issueDate: '2024-01-15', expirationDate: daysFromNow(350), status: 'active', verifiedDate: '2024-01-20' },
    ],
  },

  // ── Light Industrial Vertical (3) ───────────────────────────────────────
  {
    id: 'C-3001',
    firstName: 'Miguel',
    lastName: 'Ramirez',
    email: 'miguel.ramirez@email.com',
    phone: '(214) 555-5120',
    skills: ['Forklift Operator', 'Warehouse Management', 'RF Scanner', 'Inventory Control', 'OSHA 10', 'Shipping/Receiving'],
    experience: [
      {
        title: 'Warehouse Lead',
        company: 'Amazon Fulfillment - DFW3',
        startDate: '2020-11-01',
        current: true,
        description: 'Lead team of 15 warehouse associates in outbound shipping. Operate sit-down and reach forklifts. Maintain 99.8% order accuracy rate.',
      },
      {
        title: 'Warehouse Associate',
        company: 'FedEx Ground',
        startDate: '2018-03-01',
        endDate: '2020-10-30',
        current: false,
        description: 'Sorted and loaded packages. Operated pallet jacks and conveyor systems. Consistently exceeded daily volume targets by 15%.',
      },
    ],
    education: [{ degree: 'High School Diploma', field: 'General', institution: 'Skyline High School', graduationDate: '2018-05-25' }],
    location: { city: 'Dallas', state: 'TX', zip: '75201' },
    source: 'Walk-In',
    status: 'active',
    lastContactDate: daysFromNow(-4),
    resumeText: 'Warehouse lead with 6 years experience. Forklift certified (sit-down, reach, order picker). OSHA 10 certified. Bilingual English/Spanish.',
    credentials: [
      { id: 'CR-3001-1', candidateId: 'C-3001', type: 'Certification', name: 'Forklift Operator Certification', issueDate: '2023-06-01', expirationDate: daysFromNow(60), status: 'active', verifiedDate: '2023-06-05' },
      { id: 'CR-3001-2', candidateId: 'C-3001', type: 'Certification', name: 'OSHA 10-Hour', issueDate: '2022-01-15', status: 'active', verifiedDate: '2022-01-20' },
    ],
  },
  {
    id: 'C-3002',
    firstName: 'Brittany',
    lastName: 'Johnson',
    email: 'brittany.johnson@email.com',
    phone: '(317) 555-6144',
    skills: ['Assembly', 'Quality Inspection', 'Blueprint Reading', 'Caliper/Micrometer', 'ISO 9001', 'Lean Manufacturing'],
    experience: [
      {
        title: 'Quality Inspector',
        company: 'Rolls-Royce Indianapolis',
        startDate: '2019-05-01',
        current: true,
        description: 'Inspect aerospace engine components using precision measuring tools. Interpret engineering blueprints and GD&T specifications. Zero escape rate for 18 months.',
      },
      {
        title: 'Production Assembler',
        company: 'Subaru of Indiana Automotive',
        startDate: '2017-01-15',
        endDate: '2019-04-30',
        current: false,
        description: 'Assembled vehicle components on production line. Certified in multiple workstations. Participated in Kaizen continuous improvement events.',
      },
    ],
    education: [{ degree: 'Associate', field: 'Industrial Technology', institution: 'Ivy Tech Community College', graduationDate: '2016-12-15' }],
    location: { city: 'Indianapolis', state: 'IN', zip: '46201' },
    source: 'Job Board',
    status: 'active',
    lastContactDate: daysFromNow(-8),
    resumeText: 'Quality inspector with 7 years manufacturing experience. Aerospace and automotive background. ISO 9001 and Lean Six Sigma trained.',
  },
  {
    id: 'C-3003',
    firstName: 'Carlos',
    lastName: 'Mendez',
    email: 'carlos.mendez@email.com',
    phone: '(901) 555-7168',
    skills: ['CNC Machinist', 'G-Code', 'MasterCAM', 'Lathe Operation', 'Mill Operation', 'Blueprint Reading'],
    experience: [
      {
        title: 'CNC Machinist',
        company: 'Smith & Nephew - Memphis',
        startDate: '2018-09-01',
        current: true,
        description: 'Program and operate 5-axis CNC mills producing orthopedic implant components. Maintain tolerances of +/- 0.0005". Program in G-code and MasterCAM.',
      },
    ],
    education: [{ degree: 'Certificate', field: 'CNC Machining', institution: 'Southwest Tennessee CC', graduationDate: '2018-08-01' }],
    location: { city: 'Memphis', state: 'TN', zip: '38103' },
    source: 'Recruiter Sourced',
    status: 'active',
    lastContactDate: daysFromNow(-12),
    resumeText: 'CNC machinist with 6 years experience in medical device manufacturing. 5-axis mill and lathe. MasterCAM programming. Tight tolerance work.',
  },

  // ── Executive / Professional Vertical (3) ───────────────────────────────
  {
    id: 'C-4001',
    firstName: 'Catherine',
    lastName: 'Brooks',
    email: 'catherine.brooks@email.com',
    phone: '(212) 555-8192',
    skills: ['CFO', 'Financial Planning', 'M&A', 'SEC Reporting', 'Board Relations', 'ERP Implementation', 'IPO Readiness'],
    experience: [
      {
        title: 'VP of Finance',
        company: 'Peloton Interactive',
        startDate: '2020-03-01',
        current: true,
        description: 'Oversee $3.6B revenue planning, FP&A team of 25, and investor relations. Led cost restructuring saving $200M annually. SEC reporting and audit committee liaison.',
      },
      {
        title: 'Director of Finance',
        company: 'Warby Parker',
        startDate: '2016-01-15',
        endDate: '2020-02-28',
        current: false,
        description: 'Built finance organization from 5 to 20 people through IPO. Managed Series E fundraising of $245M.',
      },
    ],
    education: [
      { degree: 'MBA', field: 'Finance', institution: 'Wharton School of Business', graduationDate: '2015-05-15' },
      { degree: 'BS', field: 'Accounting', institution: 'NYU Stern', graduationDate: '2010-05-20' },
    ],
    location: { city: 'New York', state: 'NY', zip: '10001' },
    source: 'Executive Search',
    status: 'active',
    lastContactDate: daysFromNow(-6),
    resumeText: 'Finance executive with 14 years experience. IPO, M&A, and SEC reporting expertise. Wharton MBA. CPA. Seeking CFO role at growth-stage company.',
    notes: 'Confidential search. Currently employed. Targeting $350K-$450K base + equity.',
  },
  {
    id: 'C-4002',
    firstName: 'Robert',
    lastName: 'Washington',
    email: 'robert.washington@email.com',
    phone: '(415) 555-9216',
    skills: ['VP Engineering', 'Team Building', 'System Architecture', 'Agile/Scrum', 'AWS', 'Golang', 'Python', 'Distributed Systems'],
    experience: [
      {
        title: 'VP of Engineering',
        company: 'Stripe',
        startDate: '2019-06-01',
        current: true,
        description: 'Lead 120-person engineering org across payments infrastructure, developer experience, and platform teams. Grew team from 40 to 120. 99.999% uptime SLA.',
      },
      {
        title: 'Engineering Director',
        company: 'Uber',
        startDate: '2015-09-01',
        endDate: '2019-05-30',
        current: false,
        description: 'Directed real-time pricing and dispatch engineering. 50-person team. Designed surge pricing v3 architecture.',
      },
    ],
    education: [
      { degree: 'MS', field: 'Computer Science', institution: 'MIT', graduationDate: '2012-06-15' },
      { degree: 'BS', field: 'Computer Science', institution: 'UC Berkeley', graduationDate: '2010-05-20' },
    ],
    location: { city: 'San Francisco', state: 'CA', zip: '94105' },
    source: 'Executive Search',
    status: 'passive',
    lastContactDate: daysFromNow(-45),
    resumeText: 'Engineering executive with 14 years experience. Built and scaled engineering orgs at Stripe and Uber. MIT MS. Seeking CTO or VP Eng at Series B-D.',
    notes: 'Very passive. Only interested in CTO roles at companies with strong technical culture. $500K+ TC.',
  },
  {
    id: 'C-4003',
    firstName: 'Jennifer',
    lastName: 'Liu',
    email: 'jennifer.liu@email.com',
    phone: '(617) 555-0384',
    skills: ['HR Director', 'Talent Acquisition', 'HRIS', 'Workday', 'Employee Relations', 'DEI', 'Compensation Design'],
    experience: [
      {
        title: 'Director of Human Resources',
        company: 'HubSpot',
        startDate: '2018-04-01',
        current: true,
        description: 'Lead HR operations for 3,000-person organization. Redesigned compensation framework, launched DEI initiatives increasing diverse hiring by 35%.',
      },
      {
        title: 'HR Manager',
        company: 'Wayfair',
        startDate: '2014-09-01',
        endDate: '2018-03-31',
        current: false,
        description: 'Managed HR for 500-person engineering organization. Implemented Workday HRIS. Reduced time-to-hire from 45 to 28 days.',
      },
    ],
    education: [
      { degree: 'MBA', field: 'Organizational Behavior', institution: 'Harvard Business School', graduationDate: '2014-05-15' },
      { degree: 'BA', field: 'Psychology', institution: 'Boston University', graduationDate: '2009-05-20' },
    ],
    location: { city: 'Boston', state: 'MA', zip: '02101' },
    source: 'Referral',
    status: 'active',
    lastContactDate: daysFromNow(-9),
    resumeText: 'HR executive with 12 years experience. Scaled HR operations at high-growth tech companies. Workday expert. Harvard MBA. SHRM-SCP certified.',
    notes: 'Open to VP HR or CHRO roles. Targeting $280K-$350K base + equity.',
  },
];

// ---------------------------------------------------------------------------
// Sample Job Orders (5)
// ---------------------------------------------------------------------------

const JOB_ORDERS: JobOrder[] = [
  {
    id: 'JO-101',
    title: 'Senior Java Developer',
    clientName: 'Apex Financial Services',
    clientId: 'CL-001',
    description: 'Seeking experienced Java developer to join payments processing team. Cloud-native microservices architecture on AWS. Team of 8 engineers.',
    requirements: '5+ years Java, Spring Boot experience. AWS experience required. Microservices architecture. CI/CD pipeline experience.',
    mustHaveSkills: ['Java', 'Spring Boot', 'AWS', 'Microservices'],
    niceToHaveSkills: ['Kubernetes', 'Kafka', 'PostgreSQL', 'CI/CD'],
    location: { city: 'Austin', state: 'TX', remote: true },
    payRate: { min: 75, max: 90, type: 'hourly' },
    billRate: { min: 110, max: 135, type: 'hourly' },
    openings: 2,
    priority: 'urgent',
    status: 'open',
    createdDate: daysFromNow(-5),
    dueDate: daysFromNow(10),
    recruiterAssigned: 'recruiter-1',
  },
  {
    id: 'JO-102',
    title: 'ICU Travel Nurse - 13 Week Contract',
    clientName: 'Regional Medical Center',
    clientId: 'CL-002',
    description: 'Travel nursing assignment for experienced ICU RN. 13-week contract with potential extension. Night shift 7p-7a, 3x12 schedule.',
    requirements: 'Active RN license, 2+ years ICU experience, ACLS/BLS current, Epic EMR experience preferred.',
    mustHaveSkills: ['RN', 'ICU', 'ACLS', 'BLS'],
    niceToHaveSkills: ['Epic EMR', 'Ventilator Management', 'Critical Care'],
    location: { city: 'Nashville', state: 'TN' },
    payRate: { min: 55, max: 65, type: 'hourly' },
    billRate: { min: 85, max: 100, type: 'hourly' },
    openings: 3,
    priority: 'urgent',
    status: 'open',
    createdDate: daysFromNow(-3),
    dueDate: daysFromNow(7),
    recruiterAssigned: 'recruiter-2',
  },
  {
    id: 'JO-103',
    title: 'Warehouse Associates - 2nd Shift',
    clientName: 'National Distribution Corp',
    clientId: 'CL-003',
    description: 'High-volume warehouse seeking experienced associates for 2nd shift (2pm-10:30pm). Forklift experience a plus. Overtime available.',
    requirements: 'Warehouse experience preferred. Ability to lift 50 lbs. Steel-toe boots required. Forklift certification preferred.',
    mustHaveSkills: ['Warehouse Management', 'Shipping/Receiving'],
    niceToHaveSkills: ['Forklift Operator', 'RF Scanner', 'Inventory Control', 'OSHA 10'],
    location: { city: 'Dallas', state: 'TX' },
    payRate: { min: 18, max: 22, type: 'hourly' },
    billRate: { min: 28, max: 34, type: 'hourly' },
    openings: 10,
    priority: 'high',
    status: 'open',
    createdDate: daysFromNow(-7),
    dueDate: daysFromNow(14),
    recruiterAssigned: 'recruiter-1',
  },
  {
    id: 'JO-104',
    title: 'Chief Financial Officer',
    clientName: 'TechVenture Inc',
    clientId: 'CL-004',
    description: 'Series C SaaS company ($80M ARR) seeking CFO to lead financial strategy through IPO readiness. Reports to CEO. Board interaction required.',
    requirements: '10+ years finance experience, IPO or M&A experience, SaaS metrics expertise, CPA or MBA preferred.',
    mustHaveSkills: ['CFO', 'Financial Planning', 'SEC Reporting'],
    niceToHaveSkills: ['IPO Readiness', 'M&A', 'Board Relations', 'ERP Implementation'],
    location: { city: 'New York', state: 'NY', remote: false },
    payRate: { min: 350000, max: 450000, type: 'salary' },
    billRate: { min: 90000, max: 110000, type: 'salary' },
    openings: 1,
    priority: 'high',
    status: 'open',
    createdDate: daysFromNow(-14),
    dueDate: daysFromNow(30),
    recruiterAssigned: 'recruiter-3',
  },
  {
    id: 'JO-105',
    title: 'React/TypeScript Developer',
    clientName: 'CloudScale Software',
    clientId: 'CL-005',
    description: 'Fast-growing B2B SaaS startup needs senior frontend developer. Greenfield Next.js application. Small, collaborative team.',
    requirements: '4+ years React, TypeScript required. Next.js experience strongly preferred. GraphQL a plus.',
    mustHaveSkills: ['React', 'TypeScript'],
    niceToHaveSkills: ['Next.js', 'GraphQL', 'Tailwind CSS', 'Node.js'],
    location: { city: 'San Jose', state: 'CA', remote: true },
    payRate: { min: 70, max: 85, type: 'hourly' },
    billRate: { min: 105, max: 130, type: 'hourly' },
    openings: 1,
    priority: 'normal',
    status: 'open',
    createdDate: daysFromNow(-10),
    dueDate: daysFromNow(21),
    recruiterAssigned: 'recruiter-1',
  },
];

// ---------------------------------------------------------------------------
// All credentials (gathered from candidates + standalone)
// ---------------------------------------------------------------------------

function gatherCredentials(): Credential[] {
  const creds: Credential[] = [];
  for (const c of CANDIDATES) {
    if (c.credentials) creds.push(...c.credentials);
  }
  return creds;
}

// ---------------------------------------------------------------------------
// Sample Placements (3)
// ---------------------------------------------------------------------------

const PLACEMENTS: Placement[] = [
  {
    id: 'PL-001',
    candidateId: 'C-1003',
    jobOrderId: 'JO-OLD-001',
    clientName: 'Motorola Solutions',
    startDate: '2025-01-15',
    endDate: '2025-07-15',
    payRate: 65,
    billRate: 100,
    status: 'active',
    type: 'contract',
    lastCheckIn: daysFromNow(-14),
  },
  {
    id: 'PL-002',
    candidateId: 'C-2001',
    jobOrderId: 'JO-OLD-002',
    clientName: 'HCA Healthcare',
    startDate: '2024-09-01',
    endDate: '2024-12-01',
    payRate: 58,
    billRate: 90,
    status: 'completed',
    type: 'contract',
    lastCheckIn: '2024-11-25',
  },
  {
    id: 'PL-003',
    candidateId: 'C-3001',
    jobOrderId: 'JO-103',
    clientName: 'National Distribution Corp',
    startDate: daysFromNow(7),
    payRate: 20,
    billRate: 32,
    status: 'pending-start',
    type: 'temp-to-perm',
  },
];

// ---------------------------------------------------------------------------
// MockAdapter Implementation
// ---------------------------------------------------------------------------

export class MockAdapter implements ATSAdapter {
  name = 'mock';
  connected = true;

  private candidates: Candidate[] = CANDIDATES;
  private jobOrders: JobOrder[] = JOB_ORDERS;
  private placements: Placement[] = PLACEMENTS;
  private submissions: Submission[] = [];

  async getCandidates(filters?: CandidateFilter): Promise<Candidate[]> {
    let results = [...this.candidates];

    if (filters) {
      if (filters.skills && filters.skills.length > 0) {
        const wanted = filters.skills.map((s) => s.toLowerCase());
        results = results.filter((c) =>
          wanted.some((w) => c.skills.some((s) => s.toLowerCase().includes(w)))
        );
      }

      if (filters.location) {
        if (filters.location.state) {
          results = results.filter((c) => c.location.state.toLowerCase() === filters.location!.state!.toLowerCase());
        }
        if (filters.location.city) {
          results = results.filter((c) => c.location.city.toLowerCase().includes(filters.location!.city!.toLowerCase()));
        }
      }

      if (filters.status && filters.status.length > 0) {
        results = results.filter((c) => filters.status!.includes(c.status));
      }

      if (filters.source && filters.source.length > 0) {
        const sources = filters.source.map((s) => s.toLowerCase());
        results = results.filter((c) => sources.includes(c.source.toLowerCase()));
      }

      if (filters.lastContactAfter) {
        results = results.filter((c) => c.lastContactDate && c.lastContactDate >= filters.lastContactAfter!);
      }

      if (filters.lastContactBefore) {
        results = results.filter((c) => c.lastContactDate && c.lastContactDate <= filters.lastContactBefore!);
      }

      if (filters.limit && filters.limit > 0) {
        results = results.slice(0, filters.limit);
      }
    }

    return results;
  }

  async getCandidate(id: string): Promise<Candidate | null> {
    return this.candidates.find((c) => c.id === id) ?? null;
  }

  async updateCandidateScore(_candidateId: string, _score: ScreeningResult): Promise<void> {
    // In a real adapter this would persist the score to the ATS
  }

  async getJobOrders(filters?: JobOrderFilter): Promise<JobOrder[]> {
    let results = [...this.jobOrders];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        results = results.filter((j) => filters.status!.includes(j.status));
      }

      if (filters.priority && filters.priority.length > 0) {
        results = results.filter((j) => filters.priority!.includes(j.priority));
      }

      if (filters.clientId) {
        results = results.filter((j) => j.clientId === filters.clientId);
      }

      if (filters.recruiterAssigned) {
        results = results.filter((j) => j.recruiterAssigned === filters.recruiterAssigned);
      }

      if (filters.createdAfter) {
        results = results.filter((j) => j.createdDate >= filters.createdAfter!);
      }

      if (filters.limit && filters.limit > 0) {
        results = results.slice(0, filters.limit);
      }
    }

    return results;
  }

  async getJobOrder(id: string): Promise<JobOrder | null> {
    return this.jobOrders.find((j) => j.id === id) ?? null;
  }

  async submitCandidate(submission: Submission): Promise<void> {
    this.submissions.push(submission);
  }

  async getCredentials(candidateId?: string): Promise<Credential[]> {
    const all = gatherCredentials();
    if (candidateId) {
      return all.filter((cr) => cr.candidateId === candidateId);
    }
    return all;
  }

  async getPlacements(filters?: { status?: string[]; candidateId?: string }): Promise<Placement[]> {
    let results = [...this.placements];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        results = results.filter((p) => filters.status!.includes(p.status));
      }
      if (filters.candidateId) {
        results = results.filter((p) => p.candidateId === filters.candidateId);
      }
    }

    return results;
  }
}
