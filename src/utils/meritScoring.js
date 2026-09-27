/**
 * Merit Scoring & Ranking Engine for Ministry of Tribal Affairs (MoTA)
 *
 * Weightage formula:
 * 1. Academic Performance (40%): Based on qualifying exam marks percentage.
 * 2. Economic Need (25%): Lower annual income scores higher.
 * 3. PVTG Inclusion (15%): Particularly Vulnerable Tribal Group candidates receive full inclusion bonus.
 * 4. Gender Affirmation (10%): Female ST candidates receive 30% statutory reservation bonus.
 * 5. Document Completeness (10%): All mandatory documents verified without deficiencies.
 */

export const calculateMeritScore = (application, schemeConfig = null) => {
  let score = 0;
  const breakdown = {};

  // 1. Academic Score (Max 40 points)
  // 55% is passing threshold; normalized up to 100%
  const marks = Number(application.previousMarksPercentage) || 0;
  const academicScore = Math.min(40, Math.max(0, (marks / 100) * 40));
  breakdown.academic = {
    score: Number(academicScore.toFixed(2)),
    max: 40,
    details: `${marks}% in qualifying exam`,
  };
  score += academicScore;

  // 2. Economic Need Score (Max 25 points)
  // Income ceiling typically ₹6,00,000 for MoTA schemes (except NFST which has no ceiling)
  const incomeCeiling = schemeConfig?.eligibility?.incomeLimit || 600000;
  const income = Number(application.annualIncome) || 0;
  let economicScore = 0;
  if (income <= incomeCeiling) {
    // Inverse ratio: lower income = higher score
    economicScore = Math.max(0, ((incomeCeiling - income) / incomeCeiling) * 25);
  }
  breakdown.economic = {
    score: Number(economicScore.toFixed(2)),
    max: 25,
    details: `Annual family income ₹${income.toLocaleString()}`,
  };
  score += economicScore;

  // 3. PVTG Affirmative Action (Max 15 points)
  // Dedicated slots for 75 Notified PVTGs
  const isPvtg = Boolean(application.isPVTG);
  const pvtgScore = isPvtg ? 15 : 0;
  breakdown.pvtg = {
    score: pvtgScore,
    max: 15,
    details: isPvtg
      ? "PVTG Member (Particularly Vulnerable Tribal Group)"
      : "Standard ST",
  };
  score += pvtgScore;

  // 4. Gender Affirmation (Max 10 points)
  // 30% slots earmarked for Female ST scholars under MoTA guidelines
  const isFemale =
    application.gender && application.gender.toLowerCase() === "female";
  const genderScore = isFemale ? 10 : 5;
  breakdown.gender = {
    score: genderScore,
    max: 10,
    details: isFemale
      ? "Female Candidate (30% Earmarked Quota)"
      : `${application.gender || "Candidate"}`,
  };
  score += genderScore;

  // 5. Document Completeness & Clean Record (Max 10 points)
  const hasDeficiencies =
    application.deficiencies && application.deficiencies.length > 0;
  const docScore = hasDeficiencies ? 4 : 10;
  breakdown.documents = {
    score: docScore,
    max: 10,
    details: hasDeficiencies
      ? "Deficiencies recorded in application"
      : "All documents authentic and verified",
  };
  score += docScore;

  return {
    totalScore: Number(score.toFixed(2)),
    breakdown,
  };
};

/**
 * Sorts and ranks applications based on computed merit score and PVTG priority
 * @param {Array} applications
 * @returns {Array} Ranked applications with rank number and score
 */
export const rankApplications = (applications) => {
  const scored = applications.map((app) => {
    const merit = calculateMeritScore(app);
    return {
      ...app,
      meritScore: merit.totalScore,
      meritBreakdown: merit.breakdown,
    };
  });

  // Sort descending by merit score, prioritizing PVTG candidates in ties
  scored.sort((a, b) => {
    if (b.meritScore !== a.meritScore) {
      return b.meritScore - a.meritScore;
    }
    // Tie-breaker: PVTG candidates first
    if (b.isPVTG && !a.isPVTG) return 1;
    if (!b.isPVTG && a.isPVTG) return -1;
    // Tie-breaker 2: Lower income first
    return (Number(a.annualIncome) || 0) - (Number(b.annualIncome) || 0);
  });

  return scored.map((app, index) => ({
    ...app,
    meritRank: index + 1,
  }));
};
