// ─────────────────────────────────────────────────────────────────────────────
// FICTIONAL DEMONSTRATION DATA. No real pupil, parent, payment or result
// is used anywhere in the video. Edit freely; re-run the workflow to update.
// { __ts: <ms from now> } becomes a timestamp when the page loads.
// ─────────────────────────────────────────────────────────────────────────────
const DAY = 86400000;
const PUPIL_ID = "demo-pupil-001";

const subjects = [
  "Mathematics", "English Language", "Basic Science", "Social Studies",
  "Civic Education", "Computer Studies", "Creative Arts", "Physical Education",
];
const scores = {
  "Mathematics": [34, 52], "English Language": [32, 48], "Basic Science": [30, 45],
  "Social Studies": [28, 41], "Civic Education": [35, 50], "Computer Studies": [36, 55],
  "Creative Arts": [33, 47], "Physical Education": [37, 54],
};

const results = {};
const addResults = (session, term, shift) => subjects.forEach((s, i) => {
  const [ca, ex] = scores[s];
  results[`r_${session.replace("/", "-")}_${term.replace(" ", "")}_${i}`] = {
    pupilId: PUPIL_ID, classId: "primary-5", session, term, subject: s,
    caScore: Math.min(40, ca + shift), examScore: Math.min(60, ex + shift), status: "approved",
  };
});
addResults("2025/2026", "First Term", 0);
addResults("2024/2025", "First Term", -2);
addResults("2024/2025", "Second Term", 0);
addResults("2024/2025", "Third Term", 2);

export const demoUser = { uid: PUPIL_ID, email: "parent.demo@example.com", displayName: "Aisha Ibrahim", emailVerified: true };

export const demoData = {
  settings: {
    current: {
      session: "2025/2026", term: "First Term",
      currentSession: { name: "2025/2026", startYear: 2025, endYear: 2026 },
      resumptionDate: "2026-01-12",
    },
  },
  users: { [PUPIL_ID]: { role: "pupil", email: demoUser.email, name: "Aisha Ibrahim" } },
  pupils: {
    [PUPIL_ID]: {
      name: "Aisha Ibrahim", admissionNo: "ADM-2026-001", gender: "Female", dob: "2015-03-14",
      contact: "0800 000 0000", address: "12 Sample Street, Lagos", email: demoUser.email,
      class: { id: "primary-5", name: "Primary 5" }, religion: "",
      assignedTeacher: { id: "demo-teacher", name: "Mrs. Sample Teacher" },
      subjects, status: "active", isActive: true, admissionSession: "2024/2025", admissionTerm: "First Term",
    },
  },
  classes: { "primary-5": { name: "Primary 5", teacherId: "demo-teacher", subjects } },
  teachers: { "demo-teacher": { name: "Mrs. Sample Teacher", email: "teacher.demo@example.com" } },
  results,
  remarks: {}, attendance: {},
  fee_structures: { "fee_primary-5": { total: 150000, classId: "primary-5", className: "Primary 5" } },
  payments: {
    // Previous session fully paid, so the demo shows a clean "current term" balance with no arrears.
    [`${PUPIL_ID}_2024-2025_First Term`]: { totalPaid: 150000, balance: 0, pupilId: PUPIL_ID, session: "2024/2025", term: "First Term" },
    [`${PUPIL_ID}_2024-2025_Second Term`]: { totalPaid: 150000, balance: 0, pupilId: PUPIL_ID, session: "2024/2025", term: "Second Term" },
    [`${PUPIL_ID}_2024-2025_Third Term`]: { totalPaid: 150000, balance: 0, pupilId: PUPIL_ID, session: "2024/2025", term: "Third Term" },
    [`${PUPIL_ID}_2025-2026_First Term`]: { totalPaid: 100000, pupilId: PUPIL_ID, session: "2025/2026", term: "First Term" },
  },
  payment_transactions: {
    "RCP-DEMO-0001": { pupilId: PUPIL_ID, pupilName: "Aisha Ibrahim", className: "Primary 5", session: "2025/2026", term: "First Term",
            amountPaid: 60000, paymentMethod: "Bank Transfer", receiptNo: "RCP-DEMO-0001", balanceBefore: 150000,
            balanceAfter: 90000, totalDue: 150000, totalPaidAfter: 60000, notes: "", paymentDate: { __ts: -35 * DAY } },
    "RCP-DEMO-0002": { pupilId: PUPIL_ID, pupilName: "Aisha Ibrahim", className: "Primary 5", session: "2025/2026", term: "First Term",
            amountPaid: 40000, paymentMethod: "Cash", receiptNo: "RCP-DEMO-0002", balanceBefore: 90000,
            balanceAfter: 50000, totalDue: 150000, totalPaidAfter: 100000, notes: "", paymentDate: { __ts: -12 * DAY } },
  },
  cbt_tests: {
    test_open: { classId: "primary-5", published: true, session: "2025/2026", term: "First Term", title: "Mathematics First Term Test",
                 subject: "Mathematics", type: "Test", timerMinutes: 20, scheduledDate: { __ts: -2 * DAY }, expiryDate: { __ts: 5 * DAY } },
    test_done: { classId: "primary-5", published: true, session: "2025/2026", term: "First Term", title: "English Language Test",
                 subject: "English Language", type: "Test", timerMinutes: 25, scheduledDate: { __ts: -9 * DAY }, expiryDate: { __ts: 20 * DAY } },
  },
  cbt_attempts: {
    att1: { pupilId: PUPIL_ID, testId: "test_done", status: "completed", score: 17, total: 20, percentage: 85 },
  },
};
