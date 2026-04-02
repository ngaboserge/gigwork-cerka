-- =====================================================
-- CERKA GIG WORK PLATFORM - COMPLETE DATABASE SCHEMA
-- Independent gig work platform with all features
-- Combines migrations 001-009, 027-028 from original platform
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('worker', 'employer', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE worker_status AS ENUM ('standard', 'verified', 'preferred', 'elite');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE company_type AS ENUM ('events', 'warehouse', 'hospitality', 'industrial', 'facilities', 'other');
CREATE TYPE shift_category AS ENUM ('events', 'warehouse', 'hospitality', 'industrial', 'facilities');
CREATE TYPE shift_status AS ENUM ('draft', 'open', 'filled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE urgency_level AS ENUM ('normal', 'urgent', 'critical');
CREATE TYPE pay_type AS ENUM ('hourly', 'daily', 'fixed');
CREATE TYPE platform_type AS ENUM ('gigwork', 'marketplace', 'both');

-- Deployment statuses for the full flow
CREATE TYPE deployment_status AS ENUM (
  'applied',      -- Worker opted in, awaiting confirmation
  'confirmed',    -- Confirmed for primary slot
  'standby',      -- Confirmed as backup
  'waitlist',     -- On waitlist if slots open
  'checked_in',   -- Checked in at location
  'in_progress',  -- Shift in progress
  'completed',    -- Shift completed
  'no_show',      -- Did not show up
  'late',         -- Checked in late
  'cancelled',    -- Cancelled by worker or employer
  'rejected'      -- Rejected by employer
);

CREATE TYPE slot_type AS ENUM ('primary', 'standby', 'waitlist');
CREATE TYPE check_in_method AS ENUM ('gps', 'qr', 'manual', 'photo');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'processing', 'paid', 'disputed');
CREATE TYPE certification_status AS ENUM ('pending', 'verified', 'expired', 'revoked');
CREATE TYPE reliability_event_type AS ENUM (
  'shift_completed',
  'five_star_rating',
  'four_star_rating',
  'early_checkin',
  'late_checkin',
  'early_departure',
  'no_show',
  'low_rating',
  'cancel_24h',
  'cancel_48h',
  'milestone_10',
  'milestone_50',
  'milestone_100',
  'profile_verified'
);

-- Contract and favorites types
CREATE TYPE contract_status AS ENUM (
  'draft',
  'pending_employee',
  'pending_employer', 
  'active',
  'completed',
  'terminated',
  'disputed'
);

CREATE TYPE badge_category AS ENUM ('achievement', 'skill', 'milestone', 'special');
CREATE TYPE points_event_type AS ENUM (
  'job_completed',
  'five_star_rating',
  'four_star_rating',
  'on_time_arrival',
  'profile_verified',
  'certification_added',
  'referral_bonus',
  'milestone_bonus',
  'penalty_late',
  'penalty_no_show',
  'penalty_cancellation'
);

-- Verification types
CREATE TYPE verification_status AS ENUM (
  'not_started',
  'pending',
  'under_review',
  'approved',
  'rejected',
  'expired'
);

CREATE TYPE document_type AS ENUM (
  'national_id',
  'passport',
  'drivers_license',
  'residence_permit'
);

CREATE TYPE country_code AS ENUM (
  'RW',  -- Rwanda
  'KE',  -- Kenya
  'UG',  -- Uganda
  'TZ',  -- Tanzania
  'BI'   -- Burundi
);
-- =====================================================
-- USERS & PROFILES
-- =====================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  status user_status DEFAULT 'active',
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  
  -- Platform selection
  platform_preference platform_type DEFAULT 'both',
  platform_selected_at TIMESTAMPTZ,
  
  -- Verification
  verification_status verification_status DEFAULT 'not_started',
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.worker_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  address JSONB,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  emergency_contact JSONB,
  
  -- RELIABILITY SYSTEM
  reliability_score DECIMAL(5,2) DEFAULT 70.00 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  total_shifts_completed INT DEFAULT 0,
  total_shifts_applied INT DEFAULT 0,
  no_show_count INT DEFAULT 0,
  late_count INT DEFAULT 0,
  cancellation_count INT DEFAULT 0,
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INT DEFAULT 0,
  
  -- STATUS
  worker_status worker_status DEFAULT 'standard',
  availability_status availability_status DEFAULT 'available',
  points INT DEFAULT 0,
  
  -- Restrictions
  is_restricted BOOLEAN DEFAULT false,
  restricted_until TIMESTAMPTZ,
  restriction_reason TEXT,
  
  -- PREFERENCES
  preferred_categories TEXT[],
  max_distance_km INT DEFAULT 50,
  min_hourly_rate DECIMAL(8,2),
  
  -- VERIFICATION
  id_verified BOOLEAN DEFAULT false,
  background_check_status certification_status DEFAULT 'pending',
  background_check_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.employer_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_type company_type NOT NULL,
  tax_id VARCHAR(50),
  business_license VARCHAR(100),
  address JSONB,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  
  -- Performance
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INT DEFAULT 0,
  total_shifts_posted INT DEFAULT 0,
  total_workers_deployed INT DEFAULT 0,
  historical_no_show_rate DECIMAL(5,2) DEFAULT 8.00, -- Used for overbooking calc
  
  -- Settings
  auto_confirm_threshold INT DEFAULT 85, -- Auto-confirm workers with this reliability+
  default_overbooking_percent DECIMAL(5,2) DEFAULT 10.00,
  payment_terms INT DEFAULT 30,
  
  -- COMPANY INFO
  description TEXT,
  website VARCHAR(255),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  
  -- CONTACT & ADDRESS
  business_address JSONB,
  business_phone VARCHAR(20),
  
  -- VERIFICATION & REPUTATION
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  
  -- BILLING
  billing_address JSONB,
  payment_method JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =====================================================
-- SHIFTS - MASS DEPLOYMENT
-- =====================================================

CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category shift_category NOT NULL,
  subcategory VARCHAR(100),
  
  -- Location
  location_name VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  coordinates GEOGRAPHY(POINT),
  
  -- Timing
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INT DEFAULT 0,
  check_in_window_minutes INT DEFAULT 30, -- How early workers can check in
  late_threshold_minutes INT DEFAULT 15,  -- After this = no-show
  
  -- MASS DEPLOYMENT SLOTS
  slots_needed INT NOT NULL CHECK (slots_needed > 0),        -- What employer actually needs
  slots_total INT NOT NULL,                                   -- Including overbooking buffer
  overbooking_percent DECIMAL(5,2) DEFAULT 10.00,
  slots_applied INT DEFAULT 0,                                -- Workers who opted in
  slots_confirmed INT DEFAULT 0,                              -- Primary confirmed
  slots_standby INT DEFAULT 0,                                -- Backup confirmed
  slots_checked_in INT DEFAULT 0,                             -- Actually showed up
  
  -- Compensation
  pay_rate DECIMAL(10,2) NOT NULL CHECK (pay_rate > 0),
  pay_type pay_type NOT NULL,
  overtime_rate DECIMAL(10,2),
  standby_pay_percent DECIMAL(5,2) DEFAULT 25.00, -- % paid to standby if not needed
  
  -- Requirements
  required_certifications JSONB DEFAULT '[]',
  minimum_reliability_score INT DEFAULT 50,
  minimum_experience_months INT DEFAULT 0,
  preferred_worker_status worker_status[] DEFAULT ARRAY['standard', 'verified', 'preferred', 'elite']::worker_status[],
  dress_code VARCHAR(255),
  equipment_provided JSONB DEFAULT '[]',
  special_instructions TEXT,
  
  -- Auto-confirm settings
  auto_confirm_enabled BOOLEAN DEFAULT true,
  auto_confirm_reliability_threshold INT DEFAULT 85,
  
  -- QR Code for check-in
  qr_code_secret VARCHAR(100),
  
  -- Status
  status shift_status DEFAULT 'draft',
  urgency urgency_level DEFAULT 'normal',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_slots CHECK (slots_total >= slots_needed)
);

-- =====================================================
-- DEPLOYMENTS - WORKER ASSIGNMENTS
-- =====================================================

CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- SLOT ASSIGNMENT
  status deployment_status DEFAULT 'applied',
  slot_type slot_type,  -- NULL until confirmed
  slot_number INT,      -- Position in queue
  
  -- Confirmation
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id), -- NULL = auto-confirmed
  rejection_reason TEXT,
  
  -- Time tracking
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  
  -- CHECK-IN SYSTEM
  check_in_at TIMESTAMPTZ,
  check_in_location GEOGRAPHY(POINT),
  check_in_distance_meters DECIMAL(10,2),
  check_in_method check_in_method,
  check_in_photo_url TEXT,
  check_in_verified BOOLEAN DEFAULT false,
  is_late BOOLEAN DEFAULT false,
  late_minutes INT DEFAULT 0,
  
  -- CHECK-OUT
  check_out_at TIMESTAMPTZ,
  check_out_location GEOGRAPHY(POINT),
  check_out_method check_in_method,
  check_out_photo_url TEXT,
  early_departure BOOLEAN DEFAULT false,
  early_departure_approved BOOLEAN DEFAULT false,
  early_departure_reason TEXT,
  
  -- Hours & Pay
  break_minutes INT DEFAULT 0,
  total_minutes INT,
  total_hours DECIMAL(5,2),
  pay_rate DECIMAL(10,2) NOT NULL,
  total_pay DECIMAL(10,2),
  standby_pay DECIMAL(10,2), -- If standby not activated
  payment_status payment_status DEFAULT 'pending',
  
  -- Ratings
  worker_rating INT CHECK (worker_rating >= 1 AND worker_rating <= 5),
  worker_feedback TEXT,
  employer_rating INT CHECK (employer_rating >= 1 AND employer_rating <= 5),
  employer_feedback TEXT,
  
  -- Flags
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  flagged_by UUID REFERENCES public.profiles(id),
  flagged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shift_id, worker_id)
);
-- =====================================================
-- RELIABILITY EVENTS - SCORE TRACKING
-- =====================================================

CREATE TABLE public.reliability_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES public.deployments(id) ON DELETE SET NULL,
  event_type reliability_event_type NOT NULL,
  points_change INT NOT NULL, -- Can be positive or negative
  score_before DECIMAL(5,2) NOT NULL,
  score_after DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CERTIFICATIONS
-- =====================================================

CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certification_type VARCHAR(100) NOT NULL,
  certification_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status certification_status DEFAULT 'pending',
  document_url TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  file_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTRACTS, FAVORITES & LEVELS SYSTEM
-- =====================================================

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.deployments(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Contract details
  title VARCHAR(255) NOT NULL,
  terms TEXT NOT NULL,
  pay_rate DECIMAL(10,2) NOT NULL,
  pay_type pay_type NOT NULL DEFAULT 'hourly',
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status tracking
  status contract_status DEFAULT 'draft',
  
  -- Signatures
  employer_signed_at TIMESTAMPTZ,
  employee_signed_at TIMESTAMPTZ,
  
  -- Termination
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT,
  terminated_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.favorite_workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  hired_count INT DEFAULT 0,
  last_hired_at TIMESTAMPTZ,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employer_id, worker_id)
);

CREATE TABLE public.favorite_employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  worked_count INT DEFAULT 0,
  last_worked_at TIMESTAMPTZ,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(worker_id, employer_id)
);

CREATE TABLE public.worker_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'shield',
  category badge_category DEFAULT 'achievement',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(worker_id, badge_type)
);

CREATE TABLE public.worker_points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type points_event_type NOT NULL,
  points_change INT NOT NULL,
  points_before INT NOT NULL,
  points_after INT NOT NULL,
  related_shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  related_deployment_id UUID REFERENCES public.deployments(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =====================================================
-- TIME TRACKING SYSTEM
-- =====================================================

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  
  -- Time tracking
  clock_in_time TIMESTAMPTZ NOT NULL,
  clock_out_time TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  total_minutes INTEGER,
  total_hours DECIMAL(10, 2),
  
  -- Location tracking
  clock_in_location JSONB,
  clock_out_location JSONB,
  
  -- Pay calculation
  hourly_rate DECIMAL(10, 2) NOT NULL,
  regular_hours DECIMAL(10, 2) DEFAULT 0,
  overtime_hours DECIMAL(10, 2) DEFAULT 0,
  total_pay DECIMAL(10, 2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'approved', 'rejected', 'invoiced', 'paid')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Notes
  worker_notes TEXT,
  employer_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  
  -- Parties
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Invoice details
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  
  -- Payment
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Notes
  notes TEXT,
  terms TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE SET NULL,
  
  -- Line item details
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REVIEWS AND SUPPORT SYSTEM
-- =====================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Review details
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  
  -- Categories (for detailed feedback)
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'flagged', 'removed')),
  verified BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Response
  response_text TEXT,
  response_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(reviewer_id, deployment_id)
);

CREATE TABLE review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  
  -- User info
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Ticket details
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'account', 'payment', 'technical', 'shift', 'safety', 'other'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN (
    'low', 'normal', 'high', 'urgent'
  )),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'in_progress', 'waiting_user', 'resolved', 'closed'
  )),
  
  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Satisfaction
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_feedback TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Message details
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  
  -- Attachments
  attachments JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Article details
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Organization
  category TEXT NOT NULL,
  tags TEXT[],
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Authoring
  author_id UUID REFERENCES profiles(id),
  
  -- Metadata
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =====================================================
-- KYC VERIFICATION SYSTEM
-- =====================================================

CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Country and document info
  country country_code NOT NULL DEFAULT 'RW',
  document_type document_type NOT NULL DEFAULT 'national_id',
  
  -- Document details (encrypted in production)
  document_number VARCHAR(50),
  full_name VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(20),
  place_of_birth VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  
  -- Document images (stored in Supabase Storage)
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  
  -- Verification results
  status verification_status DEFAULT 'not_started',
  verification_method VARCHAR(50), -- 'manual', 'automated', 'hybrid'
  confidence_score DECIMAL(5,2), -- 0-100
  
  -- Face match
  face_match_score DECIMAL(5,2), -- 0-100
  face_match_passed BOOLEAN DEFAULT false,
  
  -- Document validation
  document_valid BOOLEAN DEFAULT false,
  document_validation_details JSONB,
  
  -- Admin review
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CHECK (confidence_score >= 0 AND confidence_score <= 100),
  CHECK (face_match_score >= 0 AND face_match_score <= 100)
);

CREATE TABLE public.kyc_verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES public.kyc_verifications(id) ON DELETE CASCADE,
  
  previous_status verification_status,
  new_status verification_status NOT NULL,
  
  changed_by UUID REFERENCES public.profiles(id),
  change_reason TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.verification_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  badge_type VARCHAR(50) NOT NULL, -- 'id_verified', 'face_verified', 'background_checked'
  badge_name VARCHAR(100) NOT NULL,
  badge_icon TEXT,
  
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id, badge_type)
);

-- =====================================================
-- NOTIFICATIONS SYSTEM
-- =====================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  link TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_platform_preference ON public.profiles(platform_preference);

-- Shifts indexes
CREATE INDEX idx_shifts_employer ON public.shifts(employer_id);
CREATE INDEX idx_shifts_date ON public.shifts(shift_date);
CREATE INDEX idx_shifts_status ON public.shifts(status);
CREATE INDEX idx_shifts_category ON public.shifts(category);
CREATE INDEX idx_shifts_location ON public.shifts USING GIST(coordinates);
CREATE INDEX idx_shifts_open ON public.shifts(status, shift_date) WHERE status = 'open';

-- Deployments indexes
CREATE INDEX idx_deployments_shift ON public.deployments(shift_id);
CREATE INDEX idx_deployments_worker ON public.deployments(worker_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_deployments_slot_type ON public.deployments(shift_id, slot_type);

-- Reliability events indexes
CREATE INDEX idx_reliability_events_worker ON public.reliability_events(worker_id, created_at DESC);

-- Certifications indexes
CREATE INDEX idx_certifications_worker ON public.certifications(worker_id);
CREATE INDEX idx_certifications_type ON public.certifications(certification_type, status);

-- Conversations indexes
CREATE INDEX idx_conversations_participants ON public.conversations USING GIN (participant_ids);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, read) WHERE read = FALSE;

-- Contracts indexes
CREATE INDEX idx_contracts_employer ON public.contracts(employer_id);
CREATE INDEX idx_contracts_employee ON public.contracts(employee_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_dates ON public.contracts(start_date, end_date);

-- Favorites indexes
CREATE INDEX idx_favorite_workers_employer ON public.favorite_workers(employer_id);
CREATE INDEX idx_favorite_workers_worker ON public.favorite_workers(worker_id);
CREATE INDEX idx_favorite_employers_worker ON public.favorite_employers(worker_id);
CREATE INDEX idx_favorite_employers_employer ON public.favorite_employers(employer_id);

-- Badges indexes
CREATE INDEX idx_worker_badges_worker ON public.worker_badges(worker_id);
CREATE INDEX idx_worker_badges_category ON public.worker_badges(category);

-- Points history indexes
CREATE INDEX idx_worker_points_history_worker ON public.worker_points_history(worker_id, created_at DESC);

-- Time entries indexes
CREATE INDEX idx_time_entries_worker ON time_entries(worker_id);
CREATE INDEX idx_time_entries_deployment ON time_entries(deployment_id);
CREATE INDEX idx_time_entries_shift ON time_entries(shift_id);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_clock_in ON time_entries(clock_in_time);

-- Invoices indexes
CREATE INDEX idx_invoices_worker ON invoices(worker_id);
CREATE INDEX idx_invoices_employer ON invoices(employer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Invoice line items indexes
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_time_entry ON invoice_line_items(time_entry_id);

-- Reviews indexes
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX idx_reviews_deployment ON reviews(deployment_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at);

-- Review helpfulness indexes
CREATE INDEX idx_review_helpfulness_review ON review_helpfulness(review_id);
CREATE INDEX idx_review_helpfulness_user ON review_helpfulness(user_id);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);

-- Support ticket messages indexes
CREATE INDEX idx_support_ticket_messages_ticket ON support_ticket_messages(ticket_id);
CREATE INDEX idx_support_ticket_messages_sender ON support_ticket_messages(sender_id);
CREATE INDEX idx_support_ticket_messages_created ON support_ticket_messages(created_at);

-- Help articles indexes
CREATE INDEX idx_help_articles_category ON help_articles(category);
CREATE INDEX idx_help_articles_status ON help_articles(status);
CREATE INDEX idx_help_articles_slug ON help_articles(slug);
CREATE INDEX idx_help_articles_published ON help_articles(published_at);

-- KYC indexes
CREATE INDEX idx_kyc_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_verifications(status);
CREATE INDEX idx_kyc_country ON public.kyc_verifications(country);
CREATE INDEX idx_kyc_submitted_at ON public.kyc_verifications(submitted_at);
CREATE INDEX idx_kyc_history_verification ON public.kyc_verification_history(verification_id);
CREATE INDEX idx_badges_user ON public.verification_badges(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);
-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Calculate overbooking slots
CREATE OR REPLACE FUNCTION calculate_overbooking(
  p_slots_needed INT,
  p_no_show_rate DECIMAL,
  p_urgency urgency_level
) RETURNS INT AS $$
DECLARE
  base_overbooking INT;
  urgency_buffer INT;
BEGIN
  -- Base calculation: slots × no_show_rate × 1.2
  base_overbooking := CEIL(p_slots_needed * (p_no_show_rate / 100) * 1.2);
  
  -- Add urgency buffer
  urgency_buffer := CASE p_urgency
    WHEN 'normal' THEN 0
    WHEN 'urgent' THEN 2
    WHEN 'critical' THEN 5
  END;
  
  RETURN base_overbooking + urgency_buffer;
END;
$$ LANGUAGE plpgsql;

-- Update reliability score
CREATE OR REPLACE FUNCTION update_reliability_score(
  p_worker_id UUID,
  p_event_type reliability_event_type,
  p_deployment_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
  current_score DECIMAL(5,2);
  points_change INT;
  new_score DECIMAL(5,2);
BEGIN
  -- Get current score
  SELECT reliability_score INTO current_score
  FROM public.worker_profiles
  WHERE user_id = p_worker_id;
  
  -- Determine points change
  points_change := CASE p_event_type
    WHEN 'shift_completed' THEN 5
    WHEN 'five_star_rating' THEN 3
    WHEN 'four_star_rating' THEN 2
    WHEN 'early_checkin' THEN 2
    WHEN 'late_checkin' THEN -5
    WHEN 'early_departure' THEN -10
    WHEN 'no_show' THEN -15
    WHEN 'low_rating' THEN -5
    WHEN 'cancel_24h' THEN -10
    WHEN 'cancel_48h' THEN -3
    WHEN 'milestone_10' THEN 5
    WHEN 'milestone_50' THEN 10
    WHEN 'milestone_100' THEN 15
    WHEN 'profile_verified' THEN 1
    ELSE 0
  END;
  
  -- Calculate new score (bounded 0-100)
  new_score := GREATEST(0, LEAST(100, current_score + points_change));
  
  -- Update worker profile
  UPDATE public.worker_profiles
  SET 
    reliability_score = new_score,
    updated_at = NOW()
  WHERE user_id = p_worker_id;
  
  -- Log the event
  INSERT INTO public.reliability_events (
    worker_id, deployment_id, event_type, points_change, 
    score_before, score_after, notes
  ) VALUES (
    p_worker_id, p_deployment_id, p_event_type, points_change,
    current_score, new_score, p_notes
  );
  
  -- Check for status changes
  PERFORM update_worker_status(p_worker_id);
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- Update worker status based on score and shifts
CREATE OR REPLACE FUNCTION update_worker_status(p_worker_id UUID) RETURNS worker_status AS $$
DECLARE
  current_status worker_status;
  new_status worker_status;
  score DECIMAL(5,2);
  shifts_completed INT;
BEGIN
  SELECT worker_status, reliability_score, total_shifts_completed
  INTO current_status, score, shifts_completed
  FROM public.worker_profiles
  WHERE user_id = p_worker_id;
  
  -- Determine new status
  new_status := CASE
    WHEN score >= 95 AND shifts_completed >= 200 THEN 'elite'
    WHEN score >= 90 AND shifts_completed >= 50 THEN 'preferred'
    WHEN score >= 80 AND shifts_completed >= 10 THEN 'verified'
    ELSE 'standard'
  END;
  
  -- Check for restrictions
  IF score < 30 THEN
    UPDATE public.worker_profiles
    SET 
      is_restricted = true,
      restriction_reason = 'Reliability score below minimum threshold'
    WHERE user_id = p_worker_id;
  ELSIF score >= 50 THEN
    UPDATE public.worker_profiles
    SET is_restricted = false, restriction_reason = NULL
    WHERE user_id = p_worker_id AND is_restricted = true;
  END IF;
  
  -- Update status if changed
  IF new_status != current_status THEN
    UPDATE public.worker_profiles
    SET worker_status = new_status, updated_at = NOW()
    WHERE user_id = p_worker_id;
  END IF;
  
  RETURN new_status;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate worker level based on points
CREATE OR REPLACE FUNCTION get_worker_level(p_points INT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN p_points >= 3500 THEN 'platinum'
    WHEN p_points >= 1500 THEN 'gold'
    WHEN p_points >= 500 THEN 'silver'
    ELSE 'bronze'
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to add points to worker
CREATE OR REPLACE FUNCTION add_worker_points(
  p_worker_id UUID,
  p_event_type points_event_type,
  p_shift_id UUID DEFAULT NULL,
  p_deployment_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  current_points INT;
  points_change INT;
  new_points INT;
BEGIN
  -- Get current points
  SELECT COALESCE(points, 0) INTO current_points
  FROM public.worker_profiles
  WHERE user_id = p_worker_id;
  
  -- Determine points change
  points_change := CASE p_event_type
    WHEN 'job_completed' THEN 50
    WHEN 'five_star_rating' THEN 25
    WHEN 'four_star_rating' THEN 15
    WHEN 'on_time_arrival' THEN 10
    WHEN 'profile_verified' THEN 100
    WHEN 'certification_added' THEN 50
    WHEN 'referral_bonus' THEN 100
    WHEN 'milestone_bonus' THEN 200
    WHEN 'penalty_late' THEN -25
    WHEN 'penalty_no_show' THEN -100
    WHEN 'penalty_cancellation' THEN -50
    ELSE 0
  END;
  
  new_points := GREATEST(0, current_points + points_change);
  
  -- Update worker points
  UPDATE public.worker_profiles
  SET points = new_points, updated_at = NOW()
  WHERE user_id = p_worker_id;
  
  -- Log the event
  INSERT INTO public.worker_points_history (
    worker_id, event_type, points_change, points_before, points_after,
    related_shift_id, related_deployment_id, notes
  ) VALUES (
    p_worker_id, p_event_type, points_change, current_points, new_points,
    p_shift_id, p_deployment_id, p_notes
  );
  
  -- Check for milestone badges
  PERFORM check_milestone_badges(p_worker_id, new_points);
  
  RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award milestone badges
CREATE OR REPLACE FUNCTION check_milestone_badges(p_worker_id UUID, p_points INT)
RETURNS VOID AS $$
DECLARE
  shifts_completed INT;
BEGIN
  -- Get shifts completed
  SELECT total_shifts_completed INTO shifts_completed
  FROM public.worker_profiles
  WHERE user_id = p_worker_id;
  
  -- First job badge
  IF shifts_completed = 1 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'first_job', 'First Job', 'Completed your first job', 'rocket', 'milestone')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
  
  -- 10 jobs milestone
  IF shifts_completed >= 10 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'jobs_10', 'Getting Started', 'Completed 10 jobs', 'star', 'milestone')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
  
  -- 50 jobs milestone
  IF shifts_completed >= 50 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'jobs_50', 'Reliable Worker', 'Completed 50 jobs', 'shield', 'milestone')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
  
  -- 100 jobs milestone
  IF shifts_completed >= 100 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'jobs_100', 'Century Club', 'Completed 100 jobs', 'trophy', 'milestone')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
  
  -- Level badges
  IF p_points >= 500 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'level_silver', 'Silver Status', 'Reached Silver worker status', 'star', 'achievement')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
  
  IF p_points >= 1500 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'level_gold', 'Gold Status', 'Reached Gold worker status', 'star', 'achievement')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
  
  IF p_points >= 3500 THEN
    INSERT INTO public.worker_badges (worker_id, badge_type, name, description, icon, category)
    VALUES (p_worker_id, 'level_platinum', 'Platinum Status', 'Reached Platinum worker status', 'trophy', 'achievement')
    ON CONFLICT (worker_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;
-- Function to calculate time entry totals
CREATE OR REPLACE FUNCTION calculate_time_entry_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out_time IS NOT NULL THEN
    -- Calculate total minutes
    NEW.total_minutes := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 60 - COALESCE(NEW.break_minutes, 0);
    NEW.total_hours := NEW.total_minutes / 60.0;
    
    -- Calculate regular and overtime hours (over 8 hours is overtime)
    IF NEW.total_hours <= 8 THEN
      NEW.regular_hours := NEW.total_hours;
      NEW.overtime_hours := 0;
    ELSE
      NEW.regular_hours := 8;
      NEW.overtime_hours := NEW.total_hours - 8;
    END IF;
    
    -- Calculate total pay (overtime is 1.5x)
    NEW.total_pay := (NEW.regular_hours * NEW.hourly_rate) + (NEW.overtime_hours * NEW.hourly_rate * 1.5);
    
    -- Update status
    IF NEW.status = 'in_progress' THEN
      NEW.status := 'completed';
    END IF;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update review helpfulness counts
CREATE OR REPLACE FUNCTION update_review_helpfulness_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSE
      UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_helpful AND NOT NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
    ELSIF NOT OLD.is_helpful AND NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    ELSE
      UPDATE reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.review_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(10, 2);
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(amount), 0)
  INTO v_subtotal
  FROM invoice_line_items
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update invoice
  UPDATE invoices
  SET 
    subtotal = v_subtotal,
    tax_amount = v_subtotal * (tax_rate / 100),
    total_amount = v_subtotal + (v_subtotal * (tax_rate / 100)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update favorite worker stats when hired
CREATE OR REPLACE FUNCTION update_favorite_worker_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.favorite_workers
    SET 
      hired_count = hired_count + 1,
      last_hired_at = NOW()
    WHERE employer_id = (SELECT employer_id FROM public.shifts WHERE id = NEW.shift_id)
      AND worker_id = NEW.worker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update favorite employer stats when job completed
CREATE OR REPLACE FUNCTION update_favorite_employer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.favorite_employers
    SET 
      worked_count = worked_count + 1,
      last_worked_at = NOW()
    WHERE worker_id = NEW.worker_id
      AND employer_id = (SELECT employer_id FROM public.shifts WHERE id = NEW.shift_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to award verification badge
CREATE OR REPLACE FUNCTION award_verification_badge(
  p_user_id UUID,
  p_badge_type VARCHAR(50),
  p_badge_name VARCHAR(100)
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.verification_badges (
    user_id,
    badge_type,
    badge_name,
    badge_icon
  ) VALUES (
    p_user_id,
    p_badge_type,
    p_badge_name,
    '✓'
  )
  ON CONFLICT (user_id, badge_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award badge on approval
CREATE OR REPLACE FUNCTION award_badge_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Award ID verified badge
    PERFORM award_verification_badge(
      NEW.user_id,
      'id_verified',
      'ID Verified'
    );
    
    -- Award face verified badge if face match passed
    IF NEW.face_match_passed THEN
      PERFORM award_verification_badge(
        NEW.user_id,
        'face_verified',
        'Face Verified'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update profile verification status when KYC approved
CREATE OR REPLACE FUNCTION update_profile_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.profiles
    SET 
      verification_status = 'approved',
      verified_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE public.profiles
    SET verification_status = 'rejected'
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create history entry on status change
CREATE OR REPLACE FUNCTION create_kyc_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.kyc_verification_history (
      verification_id,
      previous_status,
      new_status,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      jsonb_build_object(
        'confidence_score', NEW.confidence_score,
        'face_match_score', NEW.face_match_score
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-calculate slots_total when shift created
CREATE OR REPLACE FUNCTION calculate_shift_slots()
RETURNS TRIGGER AS $$
DECLARE
  employer_no_show_rate DECIMAL;
BEGIN
  -- Get employer's historical no-show rate
  SELECT COALESCE(historical_no_show_rate, 8.00) INTO employer_no_show_rate
  FROM public.employer_profiles
  WHERE user_id = NEW.employer_id;
  
  -- Calculate overbooking
  NEW.overbooking_percent := employer_no_show_rate * 1.2;
  NEW.slots_total := NEW.slots_needed + calculate_overbooking(
    NEW.slots_needed, 
    employer_no_show_rate, 
    NEW.urgency
  );
  
  -- Generate QR code secret
  IF NEW.qr_code_secret IS NULL THEN
    NEW.qr_code_secret := encode(gen_random_bytes(32), 'hex');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update shift counters when deployment status changes
CREATE OR REPLACE FUNCTION update_shift_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle new applications
  IF TG_OP = 'INSERT' AND NEW.status = 'applied' THEN
    UPDATE public.shifts SET slots_applied = slots_applied + 1 WHERE id = NEW.shift_id;
  END IF;
  
  -- Handle status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Decrement old status counter
    IF OLD.status = 'applied' THEN
      UPDATE public.shifts SET slots_applied = slots_applied - 1 WHERE id = NEW.shift_id;
    ELSIF OLD.status = 'confirmed' AND OLD.slot_type = 'primary' THEN
      UPDATE public.shifts SET slots_confirmed = slots_confirmed - 1 WHERE id = NEW.shift_id;
    ELSIF OLD.status = 'standby' OR OLD.slot_type = 'standby' THEN
      UPDATE public.shifts SET slots_standby = slots_standby - 1 WHERE id = NEW.shift_id;
    END IF;
    
    -- Increment new status counter
    IF NEW.status = 'confirmed' AND NEW.slot_type = 'primary' THEN
      UPDATE public.shifts SET slots_confirmed = slots_confirmed + 1 WHERE id = NEW.shift_id;
    ELSIF NEW.status = 'standby' OR NEW.slot_type = 'standby' THEN
      UPDATE public.shifts SET slots_standby = slots_standby + 1 WHERE id = NEW.shift_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- =====================================================
-- SEQUENCES
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON public.worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON public.employer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON public.deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shift calculation triggers
CREATE TRIGGER calculate_shift_slots_trigger BEFORE INSERT ON public.shifts FOR EACH ROW EXECUTE FUNCTION calculate_shift_slots();
CREATE TRIGGER update_shift_counters_trigger AFTER INSERT OR UPDATE ON public.deployments FOR EACH ROW EXECUTE FUNCTION update_shift_counters();

-- Conversation triggers
CREATE TRIGGER trigger_update_conversation_timestamp AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Favorites triggers
CREATE TRIGGER update_favorite_worker_stats_trigger AFTER INSERT OR UPDATE ON public.deployments FOR EACH ROW EXECUTE FUNCTION update_favorite_worker_stats();
CREATE TRIGGER update_favorite_employer_stats_trigger AFTER UPDATE ON public.deployments FOR EACH ROW EXECUTE FUNCTION update_favorite_employer_stats();

-- Time tracking triggers
CREATE TRIGGER calculate_time_entry_totals_trigger BEFORE INSERT OR UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_totals();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invoice triggers
CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_totals_trigger AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Review triggers
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_helpfulness_counts_trigger AFTER INSERT OR UPDATE OR DELETE ON review_helpfulness FOR EACH ROW EXECUTE FUNCTION update_review_helpfulness_counts();

-- Support triggers
CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON support_tickets FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_help_articles_updated_at BEFORE UPDATE ON help_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- KYC triggers
CREATE TRIGGER kyc_updated_at BEFORE UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_kyc_updated_at();
CREATE TRIGGER kyc_status_history AFTER UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION create_kyc_history();
CREATE TRIGGER award_badge_trigger AFTER UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION award_badge_on_approval();
CREATE TRIGGER update_profile_verification_trigger AFTER UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_profile_verification();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reliability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workers can manage their own profile
CREATE POLICY "Workers can view own profile" ON public.worker_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Workers can update own profile" ON public.worker_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Employers can view worker profiles (for hiring decisions)
CREATE POLICY "Employers can view worker profiles" ON public.worker_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);

-- Employers can manage their own profile
CREATE POLICY "Employers can view own profile" ON public.employer_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Employers can update own profile" ON public.employer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Workers can view employer profiles (for job decisions)
CREATE POLICY "Workers can view employer profiles" ON public.employer_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'worker')
);

-- =====================================================
-- SHIFTS POLICIES
-- =====================================================

-- Employers can manage their own shifts
CREATE POLICY "Employers can create shifts" ON public.shifts FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can view own shifts" ON public.shifts FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers can update own shifts" ON public.shifts FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "Employers can delete own draft shifts" ON public.shifts FOR DELETE USING (auth.uid() = employer_id AND status = 'draft');

-- Workers can view published shifts
CREATE POLICY "Workers can view published shifts" ON public.shifts FOR SELECT USING (
  status IN ('open', 'filled', 'in_progress', 'completed') AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'worker')
);

-- =====================================================
-- DEPLOYMENTS POLICIES
-- =====================================================

-- Workers can apply to shifts (create deployment)
CREATE POLICY "Workers can apply to shifts" ON public.deployments FOR INSERT WITH CHECK (
  auth.uid() = worker_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'worker')
);

-- Workers can view their own deployments
CREATE POLICY "Workers can view own deployments" ON public.deployments FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Workers can update own deployments" ON public.deployments FOR UPDATE USING (auth.uid() = worker_id);

-- Employers can view deployments for their shifts
CREATE POLICY "Employers can view shift deployments" ON public.deployments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shifts WHERE id = shift_id AND employer_id = auth.uid())
);

CREATE POLICY "Employers can update shift deployments" ON public.deployments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.shifts WHERE id = shift_id AND employer_id = auth.uid())
);

-- =====================================================
-- OTHER POLICIES
-- =====================================================

-- Certifications policies
CREATE POLICY "Workers can manage own certifications" ON public.certifications FOR ALL USING (auth.uid() = worker_id);
CREATE POLICY "Employers can view certifications" ON public.certifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);

-- Reliability events policies
CREATE POLICY "Workers can view own reliability events" ON public.reliability_events FOR SELECT USING (auth.uid() = worker_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND auth.uid() = ANY(c.participant_ids))
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids))
);

CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND auth.uid() = ANY(c.participant_ids))
);

-- Contracts policies
CREATE POLICY "Users can view their own contracts" ON public.contracts FOR SELECT USING (auth.uid() = employer_id OR auth.uid() = employee_id);
CREATE POLICY "Employers can create contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Contract parties can update contracts" ON public.contracts FOR UPDATE USING (auth.uid() = employer_id OR auth.uid() = employee_id);

-- Favorite workers policies
CREATE POLICY "Employers can view their favorite workers" ON public.favorite_workers FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers can manage their favorite workers" ON public.favorite_workers FOR ALL USING (auth.uid() = employer_id);

-- Favorite employers policies
CREATE POLICY "Workers can view their favorite employers" ON public.favorite_employers FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Workers can manage their favorite employers" ON public.favorite_employers FOR ALL USING (auth.uid() = worker_id);

-- Worker badges policies
CREATE POLICY "Anyone can view worker badges" ON public.worker_badges FOR SELECT USING (true);
CREATE POLICY "System can manage badges" ON public.worker_badges FOR ALL USING (auth.uid() = worker_id);

-- Worker points history policies
CREATE POLICY "Workers can view their own points history" ON public.worker_points_history FOR SELECT USING (auth.uid() = worker_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'User profiles for gig work platform';
COMMENT ON TABLE public.worker_profiles IS 'Extended profiles for workers';
COMMENT ON TABLE public.employer_profiles IS 'Extended profiles for employers';
COMMENT ON TABLE public.shifts IS 'Shift/job postings';
COMMENT ON TABLE public.deployments IS 'Worker applications and assignments to shifts';
COMMENT ON TABLE public.reliability_events IS 'Events that affect worker reliability scores';
COMMENT ON TABLE public.certifications IS 'Worker certifications and skills';
COMMENT ON TABLE public.conversations IS 'Message conversations between users';
COMMENT ON TABLE public.messages IS 'Individual messages in conversations';
COMMENT ON TABLE public.contracts IS 'Employment contracts between workers and employers';
COMMENT ON TABLE public.favorite_workers IS 'Employers favorite workers';
COMMENT ON TABLE public.favorite_employers IS 'Workers favorite employers';
COMMENT ON TABLE public.worker_badges IS 'Achievement badges for workers';
COMMENT ON TABLE public.worker_points_history IS 'History of points earned/lost by workers';
COMMENT ON TABLE time_entries IS 'Time tracking entries for shifts';
COMMENT ON TABLE invoices IS 'Invoices generated by workers';
COMMENT ON TABLE invoice_line_items IS 'Line items for invoices';
COMMENT ON TABLE reviews IS 'Reviews between workers and employers';
COMMENT ON TABLE review_helpfulness IS 'Helpfulness votes for reviews';
COMMENT ON TABLE support_tickets IS 'Customer support tickets';
COMMENT ON TABLE support_ticket_messages IS 'Messages in support tickets';
COMMENT ON TABLE help_articles IS 'Help documentation articles';
COMMENT ON TABLE public.kyc_verifications IS 'KYC verification records for users';
COMMENT ON TABLE public.kyc_verification_history IS 'Audit trail for verification status changes';
COMMENT ON TABLE public.verification_badges IS 'Verification badges earned by users';
COMMENT ON TABLE public.notifications IS 'User notifications';

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user profile photo stored in profile-photos bucket';
COMMENT ON COLUMN public.profiles.platform_preference IS 'User preferred platform: gigwork for gig work only, marketplace for marketplace only, both for unified experience';
COMMENT ON COLUMN public.profiles.platform_selected_at IS 'Timestamp when user last selected their platform preference';