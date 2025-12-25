
export type RouteType = 'LANDING' | 'PARENT' | 'ORG';

export interface ParentFormData {
  childAge: string;
  childGender: string;
  isDisabled: string;
  disabilityType: string;
  disabilityDegree: string;
  hasPreviousEducation: string;
  knowledgeLevel: string;
  guardianConcerns: string;
  cautionPoints: string;
  learnerInclination: string;
  prefersIndividualCounseling: string;
  smallGroupCount: string;
  preferredMode: string;
  preferredLocation: string;
}

export interface OrgFormData {
  orgName: string;
  contactNameTitle: string;
  contactPhoneEmail: string;
  venueAddress: string;
  audienceTypes: string[];
  totalCount: string;
  mustIncludeTopics: string;
  preferredMode: string;
}

export interface IntegrationConfig {
  method: 'EMAIL' | 'GOOGLE_FORM';
  targetEmail: string;
  formUrl: string;
  parentEntries: Record<string, string>;
  orgEntries: Record<string, string>;
}

export interface ReportState {
  markdown: string;
  type: RouteType;
  aiSuggestion?: string;
  isGeneratingAI: boolean;
  rawPData?: ParentFormData;
  rawOData?: OrgFormData;
}
