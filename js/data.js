// ============================================================
// DATA.JS — All static data sourced from Exam Study Plan.pdf
// (4 session blocks per day from 9 AM)
// ============================================================

const APP_VERSION = 'V2';

const SECTIONS = ['overview', 'targets', 'timetable', 'survival', 'notes'];
window.SECTIONS = SECTIONS;

// Exam schedule (from PDF)
const examSchedule = [
    { date: 'Apr 19 (Sun)', subject: 'Discrete Math & Probability', code: 'BCSNT 6023', target: new Date(2026, 3, 19, 13, 0, 0) },
    { date: 'Apr 20 (Mon)', subject: 'Computer Systems',            code: 'BCSNT 6033', target: new Date(2026, 3, 20, 13, 0, 0) },
    { date: 'Apr 21 (Tue)', subject: 'Computer Network',            code: 'CNW 112',    target: new Date(2026, 3, 21, 13, 0, 0) },
    { date: 'Apr 22 (Wed)', subject: 'English',                     code: 'ENG 111',    target: new Date(2026, 3, 22, 13, 0, 0) },
    { date: 'Apr 23 (Thu)', subject: 'Principles of Programming',   code: 'BCSNT 6013', target: new Date(2026, 3, 23, 13, 0, 0) },
];
window.examSchedule = examSchedule;

// Section C high-weightage targets (from PDF)
const subjectsData = {
    math: {
        title:      'Discrete Math & Probability (BCSNT 6023)',
        shortTitle: 'Discrete Math',
        accentColor: '#f59e0b', // amber
        targets: [
            { id: 'mat_t1', title: 'Graph Theory',     desc: "Dijkstra's Algorithm (Shortest Path), Kruskal's Algorithm (MST), Euler & Hamilton circuits. Practice 3 full problems." },
            { id: 'mat_t2', title: 'Proofs',            desc: 'Mathematical Induction — a guaranteed question. Practice proving equations using standard format.' },
            { id: 'mat_t3', title: 'Combinatorics',     desc: 'Pigeonhole Principle, Permutations & Combinations, Planar Graphs.' },
            { id: 'mat_t4', title: 'Probability',       desc: "Bayes' Theorem, Recursion, Number Theory (GCD, Congruence)." }
        ]
    },
    systems: {
        title:      'Computer Systems (BCSNT 6033)',
        shortTitle: 'Comp Systems',
        accentColor: '#6366f1', // indigo
        targets: [
            { id: 'sys_t1', title: 'Von Neumann Architecture', desc: 'Full diagram & limitations. Fetch-Decode-Execute cycle, Binary/IEEE 754 conversions.' },
            { id: 'sys_t2', title: 'Memory Hierarchy',         desc: 'Complete hierarchy, Virtual Memory (Paging), Cache mapping (Direct, Associative). Cache Organization.' },
            { id: 'sys_t3', title: 'Instruction Pipelining',   desc: 'Pipeline stages, Hazards (structural, data, control) and Solutions. Buffer Overflows.' },
            { id: 'sys_t4', title: '8086 Assembly',            desc: 'Registers, MOV/ADD/JMP/CALL instructions. Write 2-3 basic programs on paper. Stack usage.' }
        ]
    },
    network: {
        title:      'Computer Network (CNW 112)',
        shortTitle: 'Network',
        accentColor: '#10b981', // emerald
        targets: [
            { id: 'net_t1', title: 'OSI Model & TCP',    desc: 'All 7 OSI layers, TCP 3-way handshake, TCP vs UDP. Application Layer protocols (HTTP, DNS, SMTP).' },
            { id: 'net_t2', title: 'Routing & IP',        desc: 'Subnetting / IP Addressing (IPv4/IPv6). Distance Vector vs. Link State Routing algorithms.' },
            { id: 'net_t3', title: 'Security',            desc: 'Cryptography (Symmetric vs Asymmetric), CIA Triad, VPNs, Zero Trust Architecture.' },
            { id: 'net_t4', title: 'Data Link & Wireless', desc: 'Error detection, MAC protocols, Wireless Networks. Case studies with real-world protocol identification.' }
        ]
    },
    english: {
        title:      'English (ENG 111)',
        shortTitle: 'English',
        accentColor: '#f43f5e', // rose
        targets: [
            { id: 'eng_t1', title: 'Business Correspondence', desc: 'Formats for Formal Application Letters and professional emails that resolve case-study crises.' },
            { id: 'eng_t2', title: 'Essay Writing',           desc: 'Analytical/persuasive essay: Hook, Thesis statement, Topic sentences, Body paragraphs, Conclusion.' },
            { id: 'eng_t3', title: 'Comprehension',           desc: 'Summarizing text, critical reading (fact vs. opinion), identifying communication breakdowns.' }
        ]
    },
    pop: {
        title:      'Principles of Programming (BCSNT 6013)',
        shortTitle: 'PoP',
        accentColor: '#8b5cf6', // violet
        targets: [
            { id: 'pop_t1', title: 'OOP',                  desc: 'Encapsulation, Polymorphism, Multiple Inheritance (Diamond problem). Write code examples.' },
            { id: 'pop_t2', title: 'Concurrency',          desc: 'Threads vs. Async/Await, Race Conditions, Deadlocks, Software Transactional Memory (STM).' },
            { id: 'pop_t3', title: 'Logic & Functional',   desc: 'Prolog (Facts, Rules, Queries, Backtracking), Lambda Calculus (Alpha/Beta reduction), Pure Functions.' },
            { id: 'pop_t4', title: 'Syntax & Parsing',     desc: 'BNF, EBNF, Drawing Parse Trees and Abstract Syntax Trees (AST) from a given grammar.' }
        ]
    }
}
window.subjectsData = subjectsData;

// Daily timetable — 8 days, 4 sessions each
const timetableData = [
    {
        day: 'Day 1', date: 'April 11, 2026', subtitle: 'Start Now',
        sessions: [
            { s: 'S1', sub: 'PoP',          task: 'Syntax & Semantics: BNF theory, EBNF notation rules.' },
            { s: 'S2', sub: 'PoP',          task: 'Practice drawing ASTs from a given formal grammar.' },
            { s: 'S3', sub: 'Comp Systems', task: 'Von Neumann Architecture, Fetch-Decode-Execute cycle.' },
            { s: 'S4', sub: 'Comp Systems', task: 'Binary arithmetic and IEEE 754 floating point conversions.' }
        ]
    },
    {
        day: 'Day 2', date: 'April 12, 2026', subtitle: '',
        sessions: [
            { s: 'S1', sub: 'PoP',          task: 'OOP Principles (Encapsulation, Polymorphism, Diamond Problem).' },
            { s: 'S2', sub: 'PoP',          task: 'Concurrency: Threads vs Async/Await, Race Conditions.' },
            { s: 'S3', sub: 'Network',       task: 'OSI Model overview and Application Layer protocols (HTTP, DNS, SMTP).' },
            { s: 'S4', sub: 'Network',       task: 'Transport Layer — TCP 3-way handshake deep dive vs UDP.' }
        ]
    },
    {
        day: 'Day 3', date: 'April 13, 2026', subtitle: '',
        sessions: [
            { s: 'S1', sub: 'Comp Systems', task: 'Assembly Language: 8086 registers (MOV, ADD, JMP).' },
            { s: 'S2', sub: 'Comp Systems', task: 'Write 2–3 basic 8086 programs by hand (Factorial, loop counter).' },
            { s: 'S3', sub: 'Network',       task: 'Network Layer: IPv4/IPv6, Routing Algorithms (Distance Vector, Link State).' },
            { s: 'S4', sub: 'Network',       task: 'Practice IP Subnetting problems — highly likely for 15 marks.' }
        ]
    },
    {
        day: 'Day 4', date: 'April 14, 2026', subtitle: '',
        sessions: [
            { s: 'S1', sub: 'PoP',          task: 'Functional Programming (Lambda Calculus, Pure Functions).' },
            { s: 'S2', sub: 'PoP',          task: 'Logic Programming (Prolog queries, rules, backtracking).' },
            { s: 'S3', sub: 'Comp Systems', task: 'Memory Hierarchy, Cache Organization, associative mapping.' },
            { s: 'S4', sub: 'English',       task: 'Formats for Formal Letters and professional crisis-resolution emails.' }
        ]
    },
    {
        day: 'Day 5', date: 'April 15, 2026', subtitle: '',
        sessions: [
            { s: 'S1', sub: 'Discrete Math', task: 'Graph Theory Part 1: Dijkstra\'s Shortest Path Algorithm.' },
            { s: 'S2', sub: 'Discrete Math', task: 'Kruskal\'s Algorithm (MST) — practice on 3 unique drawn graphs.' },
            { s: 'S3', sub: 'Comp Systems',  task: 'Instruction Pipelining — stages, pipeline hazards and solutions.' },
            { s: 'S4', sub: 'Discrete Math', task: 'Mathematical Induction — perfect the standard proof format steps.' }
        ]
    },
    {
        day: 'Day 6', date: 'April 16, 2026', subtitle: '',
        sessions: [
            { s: 'S1', sub: 'Network',       task: 'Data Link Layer (MAC, error detection) and Wireless Networks structure.' },
            { s: 'S2', sub: 'Network',       task: 'Security: Cryptography (Symmetric vs Asymmetric), VPN tunnels.' },
            { s: 'S3', sub: 'Discrete Math', task: 'Euler/Hamilton Paths and combinatorial planar constraints.' },
            { s: 'S4', sub: 'English',        task: 'Essay structure (Hook, Thesis, Topic sentences). Write one full outline.' }
        ]
    },
    {
        day: 'Day 7', date: 'April 17, 2026', subtitle: 'Transition Day',
        sessions: [
            { s: 'S1', sub: 'Discrete Math', task: 'Recursion basics and Number Theory applications (GCD, Congruence).' },
            { s: 'S2', sub: 'Discrete Math', task: 'Combinatorics: Pigeonhole Principle and Bayes\' Theorem.' },
            { s: 'S3', sub: 'Mixed Review',  task: 'Skim past notes for PoP, Network, and Systems. Solidify Day 1–3 terms.' },
            { s: 'S4', sub: 'English',        task: 'Review past paper case studies — identifying communication breakdowns.' }
        ]
    },
    {
        day: 'Day 8', date: 'April 18, 2026', subtitle: 'Full Mock Exam',
        sessions: [
            { s: 'S1', sub: 'Discrete Math', task: 'Mock Test Part 1: Graph Theory & Shortest Path without notes.' },
            { s: 'S2', sub: 'Discrete Math', task: 'Mock Test Part 2: Proofs, Combinatorics & Matrices.' },
            { s: 'S3', sub: 'Discrete Math', task: 'Review Mock Answers: refine Dijkstra/Kruskal tracking tables.' },
            { s: 'S4', sub: 'Mental Reset',  task: 'Light reading, minimal screens. Prepare exam kit for Day 1.' }
        ]
    }
];
window.timetableData = timetableData;

// Evening review focus during exam week (from PDF)
const eveningFocus = [
    { date: new Date(2026, 3, 19), night: 'Apr 19 (Sun) Night', subject: 'Computer Systems',          focus: 'Pipelining, Memory Hierarchy, 8086 Assembly code',       color: 'indigo' },
    { date: new Date(2026, 3, 20), night: 'Apr 20 (Mon) Night', subject: 'Computer Networks',         focus: 'Subnetting, TCP/UDP, OSI layers, Security protocols',     color: 'emerald' },
    { date: new Date(2026, 3, 21), night: 'Apr 21 (Tue) Night', subject: 'English',                   focus: 'Letter formats, Essay structure. Recover energy night.', color: 'rose' },
    { date: new Date(2026, 3, 22), night: 'Apr 22 (Wed) Night', subject: 'Principles of Programming', focus: 'Parse trees, OOP concepts, Concurrency, Prolog limits',  color: 'violet' },
];
window.eveningFocus = eveningFocus;

// Exam week morning review (NEW — from PDF)
const morningReview = [
    { date: new Date(2026, 3, 19), morning: 'Apr 19 (Sun) Morn', subject: 'Discrete Math',            focus: 'Final graph theory problems, induction proofs', color: 'amber' },
    { date: new Date(2026, 3, 20), morning: 'Apr 20 (Mon) Morn', subject: 'Computer Systems',         focus: 'Assembly programs, pipelining hazard tables', color: 'indigo' },
    { date: new Date(2026, 3, 21), morning: 'Apr 21 (Tue) Morn', subject: 'Computer Network',         focus: 'Subnetting calculations, OSI quick recall', color: 'emerald' },
    { date: new Date(2026, 3, 22), morning: 'Apr 22 (Wed) Morn', subject: 'English',                  focus: 'Letter & essay format, vocabulary for formal writing', color: 'rose' },
    { date: new Date(2026, 3, 23), morning: 'Apr 23 (Thu) Morn', subject: 'Principles of Programming', focus: 'Prolog queries, lambda calculus steps, parse trees', color: 'violet' },
];
window.morningReview = morningReview;

// Motivational quotes (shown in rotating footer)
const motivationalQuotes = [
    '"The secret of getting ahead is getting started." — Mark Twain',
    '"It always seems impossible until it\'s done." — Nelson Mandela',
    '"Success is the sum of small efforts, repeated day in and day out." — Robert Collier',
    '"The best way to predict the future is to create it." — Peter Drucker',
    '"It does not matter how slowly you go as long as you do not stop." — Confucius',
    '"Focus on the 15-mark questions. If you know them, everything else follows."',
    '"Don\'t practice until you get it right. Practice until you can\'t get it wrong."',
    '"Discipline is choosing between what you want now and what you want most."',
    '"One day at a time. One session at a time. You\'ve got this."',
];
window.motivationalQuotes = motivationalQuotes;
