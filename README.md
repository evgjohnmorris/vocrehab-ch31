# Veterans Vocational Rehabilitation & Employment Guide

[![Deploy to GitHub Pages](https://github.com/evgjohnmorris/vocrehab-ch31/actions/workflows/deploy.yml/badge.svg)](https://github.com/evgjohnmorris/vocrehab-ch31/actions/workflows/deploy.yml)

An interactive Reference Manual, Entitlement Wizard, Subsistence Allowance Calculator, and VREO Contact Directory developed for Chapter 31 Vocational Rehabilitation and Employment (VR&E).

🔗 **Live Interactive App**: **[https://evgjohnmorris.github.io/vocrehab-ch31/](https://evgjohnmorris.github.io/vocrehab-ch31/)**

## Features

### 1. Unified Reference Library
- **Side-by-Side Reference Navigation**: Merges **38 U.S.C. Chapter 31** (Statutory Law), **38 CFR Part 21 Subpart A** (Federal Regulations), and the **VA M28C Manual** (Operational Policy Guidelines) in a single unified navigation tree.
- **CFR Integration**: Fully integrated **17 crucial CFR regulations** covering definitions, eligibility deferral/extensions, evaluations, feasibility assessments, case tracking statuses, and allowances.
- **Accordion Structure**: Grouped by Part, Section, and Chapter for clean categorization and seamless browsing.

### 2. Interactive Entitlement Wizard
- Guides users in establishing whether a claimant is entitled to benefits based on:
  - VA Disability Rating (10%, 20%, 30%+)
  - Discharge Characterization (stating statutory bars under 38 U.S.C. § 5303)
  - Finding of an **Employment Handicap (EH)** or **Serious Employment Handicap (SEH)**
- **Expert Linkages**: Dynamically attaches "Key Regulations Applied" tags to the outcome box, letting users click to jump directly to the relevant U.S. Code or 38 CFR section.

### 3. Subsistence Allowance Calculator
- A side-by-side comparison tool comparing:
  - **Regular Chapter 31 Rates**: Evaluated dynamically based on institutional/OJT time and number of qualifying dependents.
  - **Post-9/11 housing allowance (P911SA) Option**: Simulates housing allowances based on local E-5 with dependents BAH rates.
  - **Recommendation Engine**: Automatically identifies the financially superior option and calculates the monthly difference.

### 4. Official VR&E Counselor Directory & Escalation Guide
- **All 56 Regional Offices Resolved**: Restored the Atlanta, GA (316) and Pittsburgh, PA (311) offices into distinct, searchable entries.
- **Comprehensive Outstations & Field Offices**: Ingested and parsed the official directory, adding structured `outStations` arrays to each regional office.
- **Full Outstation Searchability**: The Counselor Directory search input filters results by regional office name, officer name, and outstation/field office name or address.
- **Escalation Path**: Features a community-backed guide for resolving communication breakdowns or unresponsiveness with counselors.

### 5. Centralized Resource Center
- Centralizes official reference materials and external support links into a structured 4-column responsive grid:
  - **Handbooks & Regulations**: School Certifying Official (SCO) Handbook, KnowVA VR&E Resource Hub, Miscellaneous VA Resources.
  - **VA Career Portals**: VA VR&E Official Homepage, Careers & Employment Hub, Veteran Resources Catalog.
  - **Specialized & Financial**: Early Access via IDES Guide, Subsistence Allowance Rate Charts, VR&E Eligibility Guides, MIRECC FinVet budgeting and financial resources.
  - **Federal & Advocacy Support**: Department of Labor (DOL) Voc Rehab FAQs, CareerOneStop Vocational Rehabilitation Portal, National Veterans Foundation (NVF) VR&E Benefit Guide.

### 6. Expanded Glossary of VR&E Terms
- **34 Comprehensive Terms**: Fully expanded the glossary array with detailed definitions and acronyms including EH, SEH, RTE, EMP, REH, IEEP, IEAP, Retroactive Induction, Revolving Fund Loans, Special Restorative Training, and more.

## Structure
- [m28c_manual.pdf](file:///c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c_manual.pdf) — Static PDF mockup reference manual.
- [m28c-interactive/](file:///c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive) — Core interactive SPA application.

## Launching locally
To run the interactive portal locally:
1. Navigate to `m28c-interactive` directory:
   ```bash
   cd m28c-interactive
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

