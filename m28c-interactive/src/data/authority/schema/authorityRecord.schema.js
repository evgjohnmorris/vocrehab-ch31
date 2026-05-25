import { z } from "zod";

export const AuthorityRecordSchema = z.object({
  id: z.string().min(1),
  canonicalCitation: z.string().min(1),
  title: z.string().min(1),

  authorityLevel: z.enum([
    "binding-statute",
    "binding-regulation",
    "federal-register",
    "public-law",
    "va-policy",
    "persuasive",
    "historical",
    "unverified"
  ]),

  sourceType: z.enum([
    "usc",
    "cfr",
    "m28c",
    "public-law",
    "federal-register",
    "va-form",
    "va-rate-table",
    "case-law",
    "gao",
    "oig",
    "advocacy"
  ]),

  sourceUrl: z.string().url(),
  officialStatus: z.enum([
    "official",
    "current-unofficial",
    "va-public",
    "archival",
    "historical",
    "unverified"
  ]),

  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceUpdated: z.string().nullable().optional(),
  effectiveDate: z.string().nullable().optional(),

  status: z.enum([
    "current",
    "reserved",
    "removed",
    "superseded",
    "not-public",
    "fetch-failed",
    "needs-review"
  ]),

  fullText: z.string(),
  plainEnglish: z.string().optional(),
  veteranUse: z.string().optional(),

  topics: z.array(z.string()).default([]),
  relatedAuthorities: z.array(z.string()).default([]),
  publicLawRefs: z.array(z.string()).default([]),
  federalRegisterRefs: z.array(z.string()).default([]),
  amendmentNotes: z.array(z.object({
    date: z.string().optional(),
    publicLaw: z.string().optional(),
    note: z.string()
  })).default([]),

  hash: z.string().min(32)
});
