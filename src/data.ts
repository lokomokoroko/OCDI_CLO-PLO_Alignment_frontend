export const schools = ["GBSEALD", "SOH", "JGSOM", "SOSE", "RGLSOSS"];

export const schoolDepartments = {
  GBSEALD: ["Information Systems and Computer Science"],
  SOH: ["Development Studies"],
  JGSOM: [],
  SOSE: [],
  RGLSOSS: [],
};

export const departmentPrograms = {
  "Information Systems and Computer Science": [
    { name: "Bachelor of Science in Management Information Systems", code: "BS MIS" },
    { name: "Bachelor of Science in Computer Science", code: "BS CS" },
  ],
  "Development Studies": [
    { name: "Bachelor of Arts in Development Studies", code: "AB DS" },
  ],
};

export const departments = ["Information Systems and Computer Science", "Development Studies"];
export const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
export const fourCOptions = ["Conscience", "Competence", "Compassion", "Commitment"];
export const versionYears = [2022, 2023, 2024, 2025, 2026];

export const teachingStrategies = [
  "Assigned Readings",
  "Case Studies",
  "Synchronous Sessions",
  "Group Discussions",
  "Problem Sets",
  "Laboratory Work",
  "Project-Based Learning",
  "Peer Assessment",
  "Guest Lectures",
  "Field Work",
];

export const programs = [
  {
    id: 1,
    name: "Bachelor of Science in Computer Science",
    code: "BS CS",
    dept: "Information Systems and Computer Science",
    school: "SOSE",
    status: "Approved",
    desc: "Prepares students in the theory and practice of computing.",
    plos: [
      { code: "PLO1", desc: "Apply computing fundamentals to solve complex problems.", fourC: ["Competence"], keyword: "algorithms" },
      { code: "PLO2", desc: "Design and implement software solutions.", fourC: ["Competence"], keyword: "software design" },
      { code: "PLO3", desc: "Communicate effectively in professional settings.", fourC: ["Communication"], keyword: "technical writing" },
      { code: "PLO4", desc: "Demonstrate ethical responsibility in computing.", fourC: ["Character"], keyword: "ethics" },
      { code: "PLO5", desc: "Engage in lifelong learning and professional development.", fourC: ["Commitment"], keyword: "self-directed learning" },
      { code: "PLO6", desc: "Function effectively in multi-disciplinary teams.", fourC: ["Competence", "Communication"], keyword: "teamwork" },
    ],
  },
  {
    id: 2,
    name: "Bachelor of Science in Management Information Systems",
    code: "BS MIS",
    dept: "Information Systems and Computer Science",
    school: "SOSE",
    status: "Pending Chair",
    desc: "Focuses on practical application of IT in organizational contexts.",
    plos: [
      { code: "PLO1", desc: "Apply IT solutions to organizational needs.", fourC: ["Competence"], keyword: "IT systems" },
      { code: "PLO2", desc: "Manage and secure information systems.", fourC: ["Competence"], keyword: "cybersecurity" },
      { code: "PLO3", desc: "Communicate technical information clearly.", fourC: ["Communication"], keyword: "documentation" },
      { code: "PLO4", desc: "Act with professional integrity.", fourC: ["Character", "Commitment"], keyword: "ethics" },
      { code: "PLO5", desc: "Adapt to evolving technologies.", fourC: ["Commitment"], keyword: "continuous learning" },
    ],
  },
  {
    id: 3,
    name: "Bachelor of Arts in Development Studies",
    code: "AB DS",
    dept: "Development Studies",
    school: "SOH",
    status: "Submitted",
    desc: "Examines social, political, and economic development issues and their impact on communities.",
    plos: [
      { code: "PLO1", desc: "Analyze development issues using interdisciplinary frameworks.", fourC: ["Competence"], keyword: "development theory" },
      { code: "PLO2", desc: "Apply research methods to study social and economic phenomena.", fourC: ["Competence"], keyword: "research methods" },
      { code: "PLO3", desc: "Communicate development insights effectively to diverse audiences.", fourC: ["Communication"], keyword: "advocacy writing" },
      { code: "PLO4", desc: "Practice ethical and socially responsible engagement.", fourC: ["Character"], keyword: "social responsibility" },
    ],
  },
];

export const teachers = [
  "Dr. A. Reyes",
  "Prof. M. Lim",
  "Prof. R. Santos",
  "Dr. J. Cruz",
  "Dr. B. Garcia",
];

export const courses = [
  {
    id: 1,
    name: "Algorithms & Complexity",
    code: "CS301",
    program: "BS CS",
    units: 3,
    desc: "Analysis of algorithms and computational complexity theory.",
    status: "Approved",
    versionYear: 2024,
    teacher: "Dr. A. Reyes",
    yearOffered: 3,
    semester: 1,
    clos: [
      { code: "CLO1", desc: "Analyze the time and space complexity of algorithms.", bloom: "Analyze" },
      { code: "CLO2", desc: "Apply divide-and-conquer and dynamic programming strategies.", bloom: "Apply" },
      { code: "CLO3", desc: "Evaluate the efficiency of sorting and searching algorithms.", bloom: "Evaluate" },
    ],
  },
  {
    id: 2,
    name: "Software Engineering",
    code: "CS302",
    program: "BS CS",
    units: 3,
    desc: "Software development lifecycle, methodologies, and quality assurance.",
    status: "Approved",
    versionYear: 2024,
    teacher: "Prof. M. Lim",
    yearOffered: 3,
    semester: 2,
    clos: [
      { code: "CLO1", desc: "Apply SDLC methodologies to real-world projects.", bloom: "Apply" },
      { code: "CLO2", desc: "Design software architecture using established patterns.", bloom: "Create" },
      { code: "CLO3", desc: "Evaluate software quality using standard metrics.", bloom: "Evaluate" },
    ],
  },
  {
    id: 3,
    name: "Database Systems",
    code: "CS303",
    program: "BS CS",
    units: 3,
    desc: "Relational and NoSQL database design, querying, and optimization.",
    status: "Pending OCDI",
    versionYear: 2023,
    teacher: "Dr. A. Reyes",
    yearOffered: 2,
    semester: 2,
    clos: [
      { code: "CLO1", desc: "Design normalized relational database schemas.", bloom: "Create" },
      { code: "CLO2", desc: "Apply SQL for data definition and manipulation.", bloom: "Apply" },
    ],
  },
  {
    id: 4,
    name: "Network Technologies",
    code: "IT201",
    program: "BS MIS",
    units: 3,
    desc: "Networking protocols, infrastructure, and security fundamentals.",
    status: "Submitted",
    versionYear: 2025,
    teacher: "Prof. R. Santos",
    yearOffered: 2,
    semester: 1,
    clos: [
      { code: "CLO1", desc: "Configure and manage network devices and protocols.", bloom: "Apply" },
      { code: "CLO2", desc: "Analyze network vulnerabilities and propose mitigations.", bloom: "Analyze" },
    ],
  },
  {
    id: 5,
    name: "Data Wrangling",
    code: "DS101",
    program: "AB DS",
    units: 3,
    desc: "Techniques for cleaning, transforming, and preparing datasets.",
    status: "Approved",
    versionYear: 2026,
    teacher: "Dr. J. Cruz",
    yearOffered: 1,
    semester: 1,
    clos: [
      { code: "CLO1", desc: "Identify and handle missing and inconsistent data.", bloom: "Analyze" },
      { code: "CLO2", desc: "Apply data transformation pipelines using Python.", bloom: "Apply" },
      { code: "CLO3", desc: "Evaluate dataset quality for downstream analysis.", bloom: "Evaluate" },
    ],
  },
];

export const alignments = [
  // CS301
  { courseCode: "CS301", cloCode: "CLO1", ploCode: "PLO1" },
  { courseCode: "CS301", cloCode: "CLO2", ploCode: "PLO1" },
  { courseCode: "CS301", cloCode: "CLO2", ploCode: "PLO2" },
  { courseCode: "CS301", cloCode: "CLO3", ploCode: "PLO2" },
  { courseCode: "CS301", cloCode: "CLO3", ploCode: "PLO3" },
  // CS302
  { courseCode: "CS302", cloCode: "CLO1", ploCode: "PLO1" },
  { courseCode: "CS302", cloCode: "CLO1", ploCode: "PLO2" },
  { courseCode: "CS302", cloCode: "CLO2", ploCode: "PLO2" },
  { courseCode: "CS302", cloCode: "CLO3", ploCode: "PLO3" },
  { courseCode: "CS302", cloCode: "CLO3", ploCode: "PLO6" },
  // CS303
  { courseCode: "CS303", cloCode: "CLO1", ploCode: "PLO2" },
  { courseCode: "CS303", cloCode: "CLO2", ploCode: "PLO1" },
  // IT201
  { courseCode: "IT201", cloCode: "CLO1", ploCode: "PLO1" },
  { courseCode: "IT201", cloCode: "CLO1", ploCode: "PLO2" },
  { courseCode: "IT201", cloCode: "CLO2", ploCode: "PLO3" },
  // DS101
  { courseCode: "DS101", cloCode: "CLO1", ploCode: "PLO1" },
  { courseCode: "DS101", cloCode: "CLO2", ploCode: "PLO1" },
  { courseCode: "DS101", cloCode: "CLO2", ploCode: "PLO2" },
  { courseCode: "DS101", cloCode: "CLO3", ploCode: "PLO3" },
];

export const approvalItems = [
  {
    id: 1,
    type: "Course",
    name: "Machine Learning",
    courseCode: "DS201",
    programCode: "AB DS",
    submittedBy: "A. Reyes",
    date: "2026-06-22",
    status: "Pending OCDI",
    currentData: "Course does not yet exist in the system.",
    proposedData: "New course DS201 (3 units, AB DS) with 4 CLOs: supervised learning, unsupervised learning, model evaluation, and ethical AI considerations.",
  },
  {
    id: 2,
    type: "Course",
    name: "Human-Computer Interaction",
    courseCode: "CS401",
    programCode: "BS CS",
    submittedBy: "M. Lim",
    date: "2026-06-23",
    status: "Pending Chair",
    currentData: "Course does not yet exist in the program.",
    proposedData: "New course CS401 (3 units, BS CS) with 3 CLOs covering UX principles, interface prototyping, and usability evaluation.",
  },
  {
    id: 3,
    type: "Course",
    name: "Enterprise Systems",
    courseCode: "IT301",
    programCode: "BS MIS",
    submittedBy: "R. Santos",
    date: "2026-06-24",
    status: "Pending OCDI",
    currentData: "IT301 Enterprise Systems — current version covers ERP basics only.",
    proposedData: "Updated IT301 to include 2 new CLOs: CRM integration (Apply) and business process reengineering using ERP tools (Analyze).",
  },
];
