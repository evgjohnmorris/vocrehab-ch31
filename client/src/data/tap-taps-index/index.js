import tapNational from './tap-national.json';
import tapDol from './tap-dol.json';
import tapVa from './tap-va.json';
import tapSba from './tap-sba.json';
import tapServiceSpecific from './tap-service-specific.json';
import tapOpportunities from './tap-opportunities.json';
import tapsSurvivorResources from './taps-survivor-resources.json';
import tapsPrograms from './taps-programs.json';
import tapsEvents from './taps-events.json';
import tapsPartners from './taps-partners.json';
import tapsVolunteer from './taps-volunteer.json';
import tapsAdvocacy from './taps-advocacy.json';
import tapsMemorial from './taps-memorial.json';

// Grouping by high-level ecosystem tabs
export const TAP_ECOSYSTEM = {
  national: tapNational,
  dol: tapDol,
  va: tapVa,
  sba: tapSba,
  serviceSpecific: tapServiceSpecific,
  opportunities: tapOpportunities
};

export const TAPS_ECOSYSTEM = {
  survivorResources: tapsSurvivorResources,
  programs: tapsPrograms,
  events: tapsEvents,
  partners: tapsPartners,
  volunteer: tapsVolunteer,
  advocacy: tapsAdvocacy
};

export const TAPS_MEMORIAL_ECOSYSTEM = tapsMemorial;

// Flat array for global search capabilities
export const ALL_RESOURCES = [
  ...tapNational.map(r => ({ ...r, section: 'TAP Transition', sourceName: 'National TAP' })),
  ...tapDol.map(r => ({ ...r, section: 'TAP Transition', sourceName: 'DOL TAP' })),
  ...tapVa.map(r => ({ ...r, section: 'TAP Transition', sourceName: 'VA TAP' })),
  ...tapSba.map(r => ({ ...r, section: 'TAP Transition', sourceName: 'SBA TAP' })),
  ...tapServiceSpecific.map(r => ({ ...r, section: 'TAP Transition', sourceName: 'Service Specific TAP' })),
  ...tapOpportunities.map(r => ({ ...r, section: 'TAP Transition', sourceName: 'TAP Opportunities' })),
  ...tapsSurvivorResources.map(r => ({ ...r, section: 'TAPS Survivor Support', sourceName: 'TAPS Core' })),
  ...tapsPrograms.map(r => ({ ...r, section: 'TAPS Survivor Support', sourceName: 'TAPS Programs' })),
  ...tapsPartners.map(r => ({ ...r, section: 'TAPS Survivor Support', sourceName: 'TAPS Partners/Sponsors' })),
  ...tapsVolunteer.map(r => ({ ...r, section: 'TAPS Survivor Support', sourceName: 'TAPS Volunteer' })),
  ...tapsAdvocacy.map(r => ({ ...r, section: 'TAPS Survivor Support', sourceName: 'TAPS Advocacy' })),
  ...tapsMemorial.map(r => ({ ...r, section: 'Ceremonial Taps & Memorials', sourceName: 'Memorial & Bugle Call' }))
];
