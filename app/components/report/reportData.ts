// Illustrative sample data across 5 institutions, each with 3 fiscal years of
// reports (FY2023-FY2025), built on a common schema so every report shows the
// same core fields most audited statements disclose: Tuition & Fees, Private
// Gifts, Grants & Contracts, Investment Income & Other on the revenue side;
// Instruction, Research, Financial Aid, Auxiliary & Facilities on the expense
// side. Patient Care is an institution-specific extra line, only present
// where a school runs a health system.
//
// Michigan's FY2025 headline figures (endowment $21.2B, total revenue +28.1%
// and private gifts +75% FY22->FY25) are the real anchors given for this demo.
// Every other number here — Michigan's category splits and year-over-year
// figures, and every figure for the four peer institutions — is illustrative
// filler generated from those anchors, meant to demonstrate the UI. Swap in
// real audited figures before this goes anywhere public.

export type LineItem = { label: string; value: number };

export type Institution = {
  slug: string;
  name: string;
  shortName: string;
  type: string;
  location: string;
  namedFundsAvailable: string[];
};

export type Report = {
  institutionSlug: string;
  year: number;
  fy: string;
  fiscalYearEnd: string;
  published: string;
  auditOpinion: "Unmodified";
  totalRevenue: number;
  totalExpenses: number;
  netPosition: number;
  endowment: number;
  privateGiftsOperating: number;
  revenueBySource: LineItem[];
  expenseByFunction: LineItem[];
  lockbox: { endowmentTotal: number; permanentlyRestricted: number; boardDesignated: number; spendingRate: number; annualPayout: number };
};

type Seed = {
  slug: string;
  name: string;
  shortName: string;
  type: string;
  location: string;
  totalRevenueFY25: number;
  totalExpensesFY25: number;
  endowmentFY25: number;
  revenueGrowthFY22to25: number;
  giftsGrowthFY22to25: number;
  giftsShareFY25: number;
  patientCareShare?: number;
  namedFundsAvailable: string[];
};

const REVENUE_SPLIT = { tuition: 0.4, grants: 0.35, investment: 0.25 };
const EXPENSE_SPLIT = { instruction: 0.45, research: 0.32, financialAid: 0.11, auxiliary: 0.12 };
const REPORT_YEARS = [2025, 2024, 2023]; // latest first
const ENDOWMENT_ANNUAL_GROWTH = 0.06;
const SPENDING_RATE = 0.045;
const PERMANENTLY_RESTRICTED = 0.88;

function buildInstitutionReports(seed: Seed): { institution: Institution; reports: Report[] } {
  const {
    slug, name, shortName, type, location, totalRevenueFY25, totalExpensesFY25, endowmentFY25,
    revenueGrowthFY22to25, giftsGrowthFY22to25, giftsShareFY25, patientCareShare = 0, namedFundsAvailable,
  } = seed;

  const revenueRate = Math.pow(1 + revenueGrowthFY22to25, 1 / 3) - 1; // smoothed annual rate implied by FY22->FY25
  const giftsRate = Math.pow(1 + giftsGrowthFY22to25, 1 / 3) - 1;
  const privateGiftsFY25 = totalRevenueFY25 * giftsShareFY25;

  const reports: Report[] = REPORT_YEARS.map((year) => {
    const yearsBack = 2025 - year;
    const totalRevenue = +(totalRevenueFY25 / Math.pow(1 + revenueRate, yearsBack)).toFixed(3);
    const totalExpenses = +(totalExpensesFY25 / Math.pow(1 + revenueRate, yearsBack)).toFixed(3);
    const privateGiftsOperating = +(privateGiftsFY25 / Math.pow(1 + giftsRate, yearsBack)).toFixed(3);
    const endowment = +(endowmentFY25 / Math.pow(1 + ENDOWMENT_ANNUAL_GROWTH, yearsBack)).toFixed(2);

    const patientCareRevenue = +(totalRevenue * patientCareShare).toFixed(3);
    const revenueRemainder = totalRevenue - patientCareRevenue - privateGiftsOperating;
    const revenueBySource: LineItem[] = [
      ...(patientCareShare > 0 ? [{ label: "Patient Care & Health System", value: patientCareRevenue }] : []),
      { label: "Tuition & Fees", value: +(revenueRemainder * REVENUE_SPLIT.tuition).toFixed(3) },
      { label: "Grants & Contracts", value: +(revenueRemainder * REVENUE_SPLIT.grants).toFixed(3) },
      { label: "Investment Income & Other", value: +(revenueRemainder * REVENUE_SPLIT.investment).toFixed(3) },
      { label: "Private Gifts (Operating)", value: privateGiftsOperating },
    ].sort((a, b) => b.value - a.value);

    const patientCareExpense = +(totalExpenses * patientCareShare).toFixed(3);
    const expenseRemainder = totalExpenses - patientCareExpense;
    const expenseByFunction: LineItem[] = [
      ...(patientCareShare > 0 ? [{ label: "Patient Care Operations", value: patientCareExpense }] : []),
      { label: "Instruction", value: +(expenseRemainder * EXPENSE_SPLIT.instruction).toFixed(3) },
      { label: "Research", value: +(expenseRemainder * EXPENSE_SPLIT.research).toFixed(3) },
      { label: "Auxiliary & Facilities", value: +(expenseRemainder * EXPENSE_SPLIT.auxiliary).toFixed(3) },
      { label: "Financial Aid", value: +(expenseRemainder * EXPENSE_SPLIT.financialAid).toFixed(3) },
    ].sort((a, b) => b.value - a.value);

    return {
      institutionSlug: slug,
      year,
      fy: `FY${year}`,
      fiscalYearEnd: `June 30, ${year}`,
      published: `November ${year}`,
      auditOpinion: "Unmodified",
      totalRevenue,
      totalExpenses,
      netPosition: +(totalRevenue - totalExpenses).toFixed(3),
      endowment,
      privateGiftsOperating,
      revenueBySource,
      expenseByFunction,
      lockbox: {
        endowmentTotal: endowment,
        permanentlyRestricted: PERMANENTLY_RESTRICTED,
        boardDesignated: +(1 - PERMANENTLY_RESTRICTED).toFixed(2),
        spendingRate: SPENDING_RATE,
        annualPayout: +(endowment * SPENDING_RATE).toFixed(3),
      },
    };
  });

  return { institution: { slug, name, shortName, type, location, namedFundsAvailable }, reports };
}

const SEEDS: Seed[] = [
  {
    slug: "michigan",
    name: "University of Michigan",
    shortName: "Michigan",
    type: "Public Research University",
    location: "Ann Arbor, MI",
    totalRevenueFY25: 13.45,
    totalExpensesFY25: 13.1,
    endowmentFY25: 21.2,
    revenueGrowthFY22to25: 0.281,
    giftsGrowthFY22to25: 0.75,
    giftsShareFY25: 0.735 / 13.45,
    patientCareShare: 0.46,
    namedFundsAvailable: ["Davidson Family Scholarship", "Rackham Merit Fellowship", "Blue Sky Research Fund"],
  },
  {
    slug: "harvard",
    name: "Harvard University",
    shortName: "Harvard",
    type: "Private Research University",
    location: "Cambridge, MA",
    totalRevenueFY25: 6.5,
    totalExpensesFY25: 6.2,
    endowmentFY25: 52,
    revenueGrowthFY22to25: 0.14,
    giftsGrowthFY22to25: 0.32,
    giftsShareFY25: 0.13,
    namedFundsAvailable: ["Widener Memorial Fund", "Radcliffe Institute Fellowship"],
  },
  {
    slug: "stanford",
    name: "Stanford University",
    shortName: "Stanford",
    type: "Private Research University",
    location: "Stanford, CA",
    totalRevenueFY25: 9.5,
    totalExpensesFY25: 9.1,
    endowmentFY25: 36,
    revenueGrowthFY22to25: 0.19,
    giftsGrowthFY22to25: 0.41,
    giftsShareFY25: 0.11,
    patientCareShare: 0.22,
    namedFundsAvailable: ["Knight-Hennessy Scholars Fund", "Stanford Data Science Fellowship"],
  },
  {
    slug: "yale",
    name: "Yale University",
    shortName: "Yale",
    type: "Private Research University",
    location: "New Haven, CT",
    totalRevenueFY25: 5.3,
    totalExpensesFY25: 5.0,
    endowmentFY25: 40,
    revenueGrowthFY22to25: 0.12,
    giftsGrowthFY22to25: 0.28,
    giftsShareFY25: 0.12,
    namedFundsAvailable: ["Yale Blue Fund for Undergraduate Aid"],
  },
  {
    slug: "mit",
    name: "MIT",
    shortName: "MIT",
    type: "Private Research University",
    location: "Cambridge, MA",
    totalRevenueFY25: 5.8,
    totalExpensesFY25: 5.5,
    endowmentFY25: 24,
    revenueGrowthFY22to25: 0.17,
    giftsGrowthFY22to25: 0.38,
    giftsShareFY25: 0.14,
    namedFundsAvailable: ["MIT.nano Research Fund", "Lincoln Laboratory Fellowship"],
  },
];

const CATALOG = SEEDS.map(buildInstitutionReports);

export const institutions: Institution[] = CATALOG.map((c) => c.institution);
export const institutionTypes = Array.from(new Set(institutions.map((i) => i.type)));

export function getInstitution(slug: string): Institution | undefined {
  return institutions.find((i) => i.slug === slug);
}

// Latest year first.
export function getReportsForInstitution(slug: string): Report[] {
  return CATALOG.find((c) => c.institution.slug === slug)?.reports ?? [];
}

export function getReport(institutionSlug: string, year: number): Report | undefined {
  return getReportsForInstitution(institutionSlug).find((r) => r.year === year);
}

export function getLatestReport(institutionSlug: string): Report | undefined {
  return getReportsForInstitution(institutionSlug)[0];
}

// Richer named-fund detail, for signed-in donors tracking a specific fund in
// the portal. The guest report chat deliberately does NOT use this — it only
// confirms a fund is listed and says payout detail "isn't disclosed," per the
// product's trust rule. This catalog is what makes that detail real once a
// donor is signed in and tracking the fund. Illustrative, same as everything
// else in this file.
export type NamedFund = {
  id: string;
  name: string;
  institutionSlug: string;
  purpose: string;
  restrictionType: "Scholarship" | "Fellowship" | "Research" | "Capital";
  marketValue: number; // $M
  spendingRate: number;
  established: number;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const NAMED_FUND_SEEDS: Omit<NamedFund, "id">[] = [
  { name: "Davidson Family Scholarship", institutionSlug: "michigan", purpose: "Need-based undergraduate scholarships in the College of Engineering", restrictionType: "Scholarship", marketValue: 12, spendingRate: 0.045, established: 1998 },
  { name: "Rackham Merit Fellowship", institutionSlug: "michigan", purpose: "Merit fellowships for incoming graduate students from underrepresented backgrounds", restrictionType: "Fellowship", marketValue: 8, spendingRate: 0.045, established: 2005 },
  { name: "Blue Sky Research Fund", institutionSlug: "michigan", purpose: "Seed funding for early-stage, high-risk research projects", restrictionType: "Research", marketValue: 5, spendingRate: 0.045, established: 2015 },
  { name: "Widener Memorial Fund", institutionSlug: "harvard", purpose: "Endowed support for the Widener Library collection and preservation", restrictionType: "Capital", marketValue: 40, spendingRate: 0.045, established: 1915 },
  { name: "Radcliffe Institute Fellowship", institutionSlug: "harvard", purpose: "Year-long fellowships for scholars, artists, and writers", restrictionType: "Fellowship", marketValue: 15, spendingRate: 0.045, established: 1999 },
  { name: "Knight-Hennessy Scholars Fund", institutionSlug: "stanford", purpose: "Full-funding graduate scholarships for future global leaders", restrictionType: "Scholarship", marketValue: 25, spendingRate: 0.045, established: 2018 },
  { name: "Stanford Data Science Fellowship", institutionSlug: "stanford", purpose: "Graduate fellowships in applied data science and statistics", restrictionType: "Fellowship", marketValue: 6, spendingRate: 0.045, established: 2020 },
  { name: "Yale Blue Fund for Undergraduate Aid", institutionSlug: "yale", purpose: "Need-based financial aid for undergraduates, part of Yale's no-loan policy", restrictionType: "Scholarship", marketValue: 18, spendingRate: 0.045, established: 2010 },
  { name: "MIT.nano Research Fund", institutionSlug: "mit", purpose: "Equipment and research support for nanoscale science and engineering", restrictionType: "Research", marketValue: 10, spendingRate: 0.045, established: 2016 },
  { name: "Lincoln Laboratory Fellowship", institutionSlug: "mit", purpose: "Graduate fellowships tied to Lincoln Laboratory defense research", restrictionType: "Fellowship", marketValue: 4, spendingRate: 0.045, established: 2012 },
];

export const namedFunds: NamedFund[] = NAMED_FUND_SEEDS.map((f) => ({ ...f, id: slugify(f.name) }));

export function getNamedFund(id: string): NamedFund | undefined {
  return namedFunds.find((f) => f.id === id);
}

export function getNamedFundsForInstitution(institutionSlug: string): NamedFund[] {
  return namedFunds.filter((f) => f.institutionSlug === institutionSlug);
}
