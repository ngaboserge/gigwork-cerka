export type UserRole = 'employer' | 'employee' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  termsAcceptedAt?: string;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  jobAlerts: boolean;
  messageAlerts: boolean;
  applicationAlerts: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
}

export interface EmployerProfile extends User {
  role: 'employer';
  companyName: string;
  companyDescription?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  companyLogo?: string;
  companyAddress?: string;
  taxId?: string;
  totalJobsPosted: number;
  totalHires: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
  avgResponseTime: number; // in hours
  verified: VerificationStatus;
  verificationDocuments: Document[];
  paymentMethods: PaymentMethod[];
  billingAddress?: Address;
}

export interface EmployeeProfile extends User {
  role: 'employee';
  headline?: string;
  bio?: string;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  hourlyRate?: number;
  dailyRate?: number;
  availability: AvailabilityStatus;
  availabilitySchedule: AvailabilitySchedule;
  preferredJobTypes: JobType[];
  preferredCategories: string[];
  preferredLocations: string[];
  willingToTravel: boolean;
  travelRadius?: number; // in miles
  completedJobs: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
  reliabilityScore: number;
  verified: VerificationStatus;
  verificationDocuments: Document[];
  backgroundCheckStatus: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  bankAccount?: BankAccount;
  portfolio: PortfolioItem[];
  savedJobs: string[];
  recentlyViewedJobs: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  verified: boolean;
  endorsements: number;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree?: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
  document?: Document;
}

export interface Language {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface AvailabilitySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
  exceptions: AvailabilityException[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

export interface AvailabilityException {
  date: string;
  available: boolean;
  slots?: TimeSlot[];
  reason?: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
  verifiedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export type DocumentType = 'id' | 'license' | 'certification' | 'insurance' | 'tax' | 'contract' | 'other';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  routingLast4: string;
  verified: boolean;
}

export type BackgroundCheckStatus = 'not_started' | 'pending' | 'passed' | 'failed' | 'expired';

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  jobId?: string;
  createdAt: string;
}

// Job Types
export type JobStatus = 'draft' | 'open' | 'paused' | 'in_progress' | 'completed' | 'cancelled';
export type JobType = 'hourly' | 'fixed' | 'daily';
export type JobUrgency = 'normal' | 'urgent' | 'critical';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerLogo?: string;
  employerRating: number;
  employerVerified: boolean;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  category: string;
  subcategory?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  isRemote: boolean;
  jobType: JobType;
  payRate: number;
  payRateMax?: number;
  estimatedHours?: number;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
  status: JobStatus;
  urgency: JobUrgency;
  applicationsCount: number;
  viewsCount: number;
  savedCount: number;
  maxApplicants?: number;
  autoCloseDate?: string;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
  parentJobId?: string;
  templateId?: string;
  tags: string[];
  equipmentProvided: string[];
  equipmentRequired: string[];
  dressCode?: string;
  parkingInfo?: string;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  filledAt?: string;
}

export interface JobTemplate {
  id: string;
  employerId: string;
  name: string;
  job: Partial<Job>;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  savedAt: string;
  notes?: string;
}

export interface JobView {
  id: string;
  jobId: string;
  userId: string;
  viewedAt: string;
  duration: number; // seconds
}

export interface JobAlert {
  id: string;
  userId: string;
  name: string;
  filters: JobFilters;
  frequency: 'instant' | 'daily' | 'weekly';
  enabled: boolean;
  lastSentAt?: string;
  createdAt: string;
}

export interface JobFilters {
  search?: string;
  categories?: string[];
  locations?: string[];
  radius?: number;
  jobTypes?: JobType[];
  minPay?: number;
  maxPay?: number;
  urgency?: JobUrgency[];
  experienceLevel?: string[];
  skills?: string[];
  isRemote?: boolean;
  postedWithin?: number; // days
  sortBy?: 'newest' | 'pay_high' | 'pay_low' | 'distance' | 'relevance';
}

// Application Types
export type ApplicationStatus = 'pending' | 'viewed' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn' | 'hired' | 'completed';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobLocation: string;
  jobPayRate: number;
  jobType: JobType;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeRating: number;
  employeeSkills: string[];
  employerId: string;
  employerName: string;
  coverLetter?: string;
  proposedRate?: number;
  availability?: string;
  answers: ApplicationAnswer[];
  attachments: Document[];
  status: ApplicationStatus;
  statusHistory: StatusChange[];
  employerNotes?: string;
  internalRating?: number;
  interview?: Interview;
  contract?: Contract;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  respondedAt?: string;
}

export interface ApplicationAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface StatusChange {
  status: ApplicationStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  duration: number; // minutes
  type: 'in_person' | 'phone' | 'video';
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  rating?: number;
  createdAt: string;
}

export interface Contract {
  id: string;
  applicationId: string;
  jobId: string;
  employerId: string;
  employeeId: string;
  terms: string;
  payRate: number;
  payType: JobType;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'pending_employee' | 'pending_employer' | 'active' | 'completed' | 'terminated' | 'disputed';
  employerSignedAt?: string;
  employeeSignedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Time Tracking & Payments
export interface TimeEntry {
  id: string;
  contractId: string;
  jobId: string;
  employeeId: string;
  employerId: string;
  clockInAt: string;
  clockOutAt?: string;
  breakMinutes: number;
  totalMinutes?: number;
  location?: { lat: number; lng: number };
  notes?: string;
  status: 'active' | 'completed' | 'approved' | 'disputed' | 'adjusted';
  approvedAt?: string;
  approvedBy?: string;
  adjustedMinutes?: number;
  adjustmentReason?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  jobId: string;
  employeeId: string;
  employerId: string;
  periodStart: string;
  periodEnd: string;
  timeEntries: string[];
  hoursWorked: number;
  hourlyRate: number;
  subtotal: number;
  platformFee: number;
  taxes: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'disputed';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method: string;
  transactionId?: string;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  type: 'payment' | 'time_entry' | 'contract' | 'review' | 'other';
  relatedId: string;
  initiatorId: string;
  initiatorRole: UserRole;
  respondentId: string;
  title: string;
  description: string;
  evidence: Document[];
  status: 'open' | 'under_review' | 'resolved' | 'escalated' | 'closed';
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  messages: DisputeMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  attachments: Document[];
  createdAt: string;
}

// Reviews & Ratings
export interface Review {
  id: string;
  jobId: string;
  jobTitle: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerRole: UserRole;
  revieweeId: string;
  revieweeName: string;
  overallRating: number;
  ratings: ReviewRating[];
  title?: string;
  content: string;
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;
  wouldWorkAgain: boolean;
  response?: ReviewResponse;
  helpful: number;
  reported: boolean;
  status: 'pending' | 'published' | 'hidden' | 'removed';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRating {
  category: string;
  rating: number;
}

export interface ReviewResponse {
  content: string;
  createdAt: string;
}

// Messaging
export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
  type: 'direct' | 'job_inquiry' | 'application' | 'support';
  lastMessage?: string;
  lastMessageAt: string;
  lastMessageBy?: string;
  unreadCount: number;
  archived: boolean;
  muted: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  lastReadAt?: string;
  typing?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'system' | 'template';
  attachments: MessageAttachment[];
  replyTo?: string;
  readBy: MessageRead[];
  edited: boolean;
  editedAt?: string;
  deleted: boolean;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface MessageRead {
  userId: string;
  readAt: string;
}

export interface MessageTemplate {
  id: string;
  userId: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usageCount: number;
  createdAt: string;
}

// Notifications
export type NotificationType = 
  | 'application_received' | 'application_viewed' | 'application_status' 
  | 'interview_scheduled' | 'interview_reminder' | 'interview_cancelled'
  | 'message_received' | 'job_alert' | 'job_filled' | 'job_cancelled'
  | 'contract_sent' | 'contract_signed' | 'contract_terminated'
  | 'payment_received' | 'payment_sent' | 'payment_failed'
  | 'review_received' | 'review_response'
  | 'verification_approved' | 'verification_rejected'
  | 'dispute_update' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  link?: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
  createdAt: string;
}

// Reports & Analytics
export interface EmployerAnalytics {
  period: string;
  jobsPosted: number;
  totalViews: number;
  totalApplications: number;
  applicationRate: number;
  hireRate: number;
  avgTimeToHire: number;
  avgCostPerHire: number;
  totalSpent: number;
  topCategories: { category: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  viewsByDay: { date: string; views: number }[];
  applicationsByDay: { date: string; applications: number }[];
}

export interface EmployeeAnalytics {
  period: string;
  applicationsSubmitted: number;
  interviewsScheduled: number;
  jobsCompleted: number;
  totalEarnings: number;
  avgHourlyRate: number;
  hoursWorked: number;
  responseRate: number;
  profileViews: number;
  applicationsByStatus: { status: string; count: number }[];
  earningsByMonth: { month: string; amount: number }[];
  topSkills: { skill: string; jobs: number }[];
}

// Reports
export interface Report {
  id: string;
  reporterId: string;
  reporterRole: UserRole;
  targetType: 'user' | 'job' | 'review' | 'message';
  targetId: string;
  reason: string;
  description: string;
  evidence: Document[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

// Help & Support
export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: SupportMessage[];
  attachments: Document[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'support' | 'system';
  content: string;
  attachments: Document[];
  createdAt: string;
}

// Worker Levels & Badges
export type WorkerLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface WorkerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'achievement' | 'skill' | 'milestone' | 'special';
}

export interface WorkerLevelInfo {
  level: WorkerLevel;
  points: number;
  nextLevelPoints: number;
  benefits: string[];
  badges: WorkerBadge[];
}

// Shift Scheduling
export interface ScheduledShift {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  employerAvatar?: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'swap_requested';
  payRate: number;
  payType: JobType;
  notes?: string;
  swapRequestedBy?: string;
  swapRequestedWith?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftSwapRequest {
  id: string;
  shiftId: string;
  requesterId: string;
  requesterName: string;
  targetWorkerId?: string;
  targetWorkerName?: string;
  status: 'open' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  createdAt: string;
  respondedAt?: string;
}

// Favorites System
export interface FavoriteWorker {
  id: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
  workerRating: number;
  workerSkills: string[];
  employerId: string;
  notes?: string;
  hiredCount: number;
  lastHiredAt?: string;
  addedAt: string;
}

export interface FavoriteEmployer {
  id: string;
  employerId: string;
  employerName: string;
  employerLogo?: string;
  employerRating: number;
  companyName: string;
  workerId: string;
  notes?: string;
  workedCount: number;
  lastWorkedAt?: string;
  addedAt: string;
}

// Constants
export const JOB_CATEGORIES = [
  { id: 'construction', name: 'Construction', subcategories: ['General Labor', 'Carpentry', 'Electrical', 'Plumbing', 'Painting', 'Roofing', 'HVAC', 'Demolition'] },
  { id: 'warehouse', name: 'Warehouse', subcategories: ['Picking & Packing', 'Forklift Operation', 'Inventory Management', 'Loading/Unloading', 'Quality Control'] },
  { id: 'delivery', name: 'Delivery', subcategories: ['Package Delivery', 'Food Delivery', 'Furniture Delivery', 'Medical Delivery', 'Courier Services'] },
  { id: 'cleaning', name: 'Cleaning', subcategories: ['Residential', 'Commercial', 'Industrial', 'Post-Construction', 'Deep Cleaning'] },
  { id: 'events', name: 'Events', subcategories: ['Setup/Teardown', 'Catering Staff', 'Security', 'Registration', 'AV Support', 'Photography'] },
  { id: 'retail', name: 'Retail', subcategories: ['Cashier', 'Stock Associate', 'Sales Associate', 'Visual Merchandising', 'Inventory'] },
  { id: 'food_service', name: 'Food Service', subcategories: ['Server', 'Bartender', 'Line Cook', 'Prep Cook', 'Dishwasher', 'Host/Hostess', 'Barista'] },
  { id: 'administrative', name: 'Administrative', subcategories: ['Data Entry', 'Reception', 'Filing', 'Customer Service', 'Virtual Assistant'] },
  { id: 'technical', name: 'Technical', subcategories: ['IT Support', 'Network Setup', 'Equipment Repair', 'Installation', 'Troubleshooting'] },
  { id: 'healthcare', name: 'Healthcare', subcategories: ['CNA', 'Home Health Aide', 'Medical Assistant', 'Phlebotomy', 'Patient Transport'] },
  { id: 'security', name: 'Security', subcategories: ['Event Security', 'Site Security', 'Patrol', 'Access Control', 'Surveillance'] },
  { id: 'transportation', name: 'Transportation', subcategories: ['Driver', 'Chauffeur', 'Moving', 'Shuttle Service', 'Valet'] },
  { id: 'manufacturing', name: 'Manufacturing', subcategories: ['Assembly', 'Machine Operation', 'Quality Inspection', 'Packaging', 'Maintenance'] },
  { id: 'landscaping', name: 'Landscaping', subcategories: ['Lawn Care', 'Tree Service', 'Irrigation', 'Snow Removal', 'Hardscaping'] },
  { id: 'other', name: 'Other', subcategories: ['General Labor', 'Miscellaneous'] },
] as const;

export const SKILLS_LIST = [
  'Forklift Operation', 'Heavy Lifting', 'Inventory Management', 'Safety Compliance',
  'Customer Service', 'Cash Handling', 'Food Handling', 'ServSafe Certified',
  'CPR/First Aid', 'Driver License', 'CDL', 'OSHA Certified',
  'Bilingual Spanish', 'Bilingual Chinese', 'Microsoft Office', 'Data Entry',
  'Power Tools', 'Hand Tools', 'Welding', 'Electrical Work',
  'Plumbing', 'HVAC', 'Painting', 'Carpentry',
  'Event Setup', 'AV Equipment', 'Photography', 'Bartending',
  'Cooking', 'Baking', 'Cleaning', 'Pressure Washing',
  'Landscaping', 'Snow Removal', 'Security', 'Crowd Control',
] as const;

export const EXPERIENCE_LEVELS = [
  { id: 'entry', name: 'Entry Level', description: 'No experience required' },
  { id: 'intermediate', name: 'Intermediate', description: '1-3 years experience' },
  { id: 'experienced', name: 'Experienced', description: '3-5 years experience' },
  { id: 'expert', name: 'Expert', description: '5+ years experience' },
] as const;

export const COMPANY_SIZES = [
  { id: '1-10', name: '1-10 employees' },
  { id: '11-50', name: '11-50 employees' },
  { id: '51-200', name: '51-200 employees' },
  { id: '201-500', name: '201-500 employees' },
  { id: '501-1000', name: '501-1000 employees' },
  { id: '1000+', name: '1000+ employees' },
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];
