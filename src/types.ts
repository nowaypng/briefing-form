export interface BriefingData {
  companyName: string;
  businessDescription: string;
  mainProductService: string;
  idealCustomer: string;
  websiteGoal: string;
  businessPains: string;
  timeConsumingTasks: string;
  repetitiveTasks: string;
  automationWishes: string;
  visitorAction: string;
}

export type Step = 
  | 'welcome'
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'
  | 'review'
  | 'success';

export interface Question {
  id: keyof BriefingData;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
  helperText?: string;
}
