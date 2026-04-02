-- =====================================================
-- CERKA GIG WORK PLATFORM - DATABASE SCHEMA
-- Independent gig work platform with shift management
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
  company_name VARCHAR(200) NOT NULL,
  company_type company_type NOT NULL,
  contact_person VARCHAR(100),
  business_license VARCHAR(100),
  tax_id VARCHAR(50),
  
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
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INT DEFAULT 0,
  
  -- BILLING
  billing_address JSONB,
  payment_method JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SHIFTS & JOBS SYSTEM
-- =====================================================

CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- BASIC INFO
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category shift_category NOT NULL,
  
  -- SCHEDULING
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Africa/Kigali',
  
  -- LOCATION
  location_name VARCHAR(200) NOT NULL,
  address JSONB NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- REQUIREMENTS
  required_workers INT NOT NULL DEFAULT 1,
  standby_workers INT DEFAULT 0,
  min_age INT DEFAULT 18,
  required_skills TEXT[],
  physical_requirements TEXT,
  dress_code TEXT,
  
  -- COMPENSATION
  pay_type pay_type NOT NULL DEFAULT 'hourly',
  hourly_rate DECIMAL(8,2),
  daily_rate DECIMAL(8,2),
  fixed_amount DECIMAL(8,2),
  overtime_rate DECIMAL(8,2),
  bonus_amount DECIMAL(8,2),
  
  -- STATUS & URGENCY
  status shift_status DEFAULT 'draft',
  urgency_level urgency_level DEFAULT 'normal',
  
  -- OVERBOOKING SETTINGS
  allow_overbooking BOOLEAN DEFAULT true,
  overbooking_percentage DECIMAL(5,2) DEFAULT 20.00,
  
  -- METADATA
  application_deadline TIMESTAMPTZ,
  auto_confirm BOOLEAN DEFAULT false,
  requires_background_check BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEPLOYMENT SYSTEM (Worker Assignments)
-- =====================================================

CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- DEPLOYMENT STATUS
  status deployment_status DEFAULT 'applied',
  slot_type slot_type DEFAULT 'primary',
  
  -- APPLICATION
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  application_notes TEXT,
  
  -- CONFIRMATION
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id),
  
  -- CHECK-IN/OUT
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  check_in_method check_in_method,
  check_in_location POINT,
  check_in_photo_url TEXT,
  
  -- COMPLETION
  completed_at TIMESTAMPTZ,
  hours_worked DECIMAL(5,2),
  break_time_minutes INT DEFAULT 0,
  
  -- PAYMENT
  payment_status payment_status DEFAULT 'pending',
  amount_earned DECIMAL(10,2),
  
  -- RATINGS (Both directions)
  worker_rating INT CHECK (worker_rating >= 1 AND worker_rating <= 5),
  worker_review TEXT,
  employer_rating INT CHECK (employer_rating >= 1 AND employer_rating <= 5),
  employer_review TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shift_id, worker_id)
);

-- =====================================================
-- RELIABILITY & SCORING SYSTEM
-- =====================================================

CREATE TABLE public.reliability_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type reliability_event_type NOT NULL,
  shift_id UUID REFERENCES public.shifts(id),
  deployment_id UUID REFERENCES public.deployments(id),
  
  -- SCORING
  points_change DECIMAL(5,2) NOT NULL,
  new_score DECIMAL(5,2) NOT NULL,
  
  -- CONTEXT
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CERTIFICATIONS & SKILLS
-- =====================================================

CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  issuing_organization VARCHAR(200),
  certification_number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  
  status certification_status DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  
  document_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TIME TRACKING SYSTEM
-- =====================================================

CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  
  -- TIME TRACKING
  clock_in_time TIMESTAMPTZ NOT NULL,
  clock_out_time TIMESTAMPTZ,
  break_start_time TIMESTAMPTZ,
  break_end_time TIMESTAMPTZ,
  
  -- LOCATION VERIFICATION
  clock_in_location POINT,
  clock_out_location POINT,
  
  -- CALCULATED FIELDS
  total_hours DECIMAL(5,2),
  break_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  
  -- APPROVAL
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTRACTS & AGREEMENTS
-- =====================================================

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- CONTRACT DETAILS
  contract_type VARCHAR(50) DEFAULT 'shift_based',
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- TERMS
  hourly_rate DECIMAL(8,2),
  total_amount DECIMAL(10,2),
  payment_terms TEXT,
  
  -- STATUS
  status VARCHAR(50) DEFAULT 'active',
  signed_by_worker BOOLEAN DEFAULT false,
  signed_by_employer BOOLEAN DEFAULT false,
  worker_signature_date TIMESTAMPTZ,
  employer_signature_date TIMESTAMPTZ,
  
  -- DOCUMENTS
  contract_document_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES public.shifts(id),
  
  -- PARTICIPANTS
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- METADATA
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(participant_1, participant_2, shift_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  
  -- STATUS
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS SYSTEM
-- =====================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  
  -- RELATED ENTITIES
  shift_id UUID REFERENCES public.shifts(id),
  deployment_id UUID REFERENCES public.deployments(id),
  
  -- STATUS
  read_at TIMESTAMPTZ,
  
  -- METADATA
  data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUPPORT SYSTEM
-- =====================================================

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium',
  
  -- STATUS
  status VARCHAR(50) DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id),
  
  -- RELATED ENTITIES
  shift_id UUID REFERENCES public.shifts(id),
  deployment_id UUID REFERENCES public.deployments(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Shifts indexes
CREATE INDEX idx_shifts_employer_id ON public.shifts(employer_id);
CREATE INDEX idx_shifts_status ON public.shifts(status);
CREATE INDEX idx_shifts_category ON public.shifts(category);
CREATE INDEX idx_shifts_start_date ON public.shifts(start_date);
CREATE INDEX idx_shifts_location ON public.shifts USING GIST(ST_Point(longitude, latitude));

-- Deployments indexes
CREATE INDEX idx_deployments_shift_id ON public.deployments(shift_id);
CREATE INDEX idx_deployments_worker_id ON public.deployments(worker_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);

-- Time entries indexes
CREATE INDEX idx_time_entries_deployment_id ON public.time_entries(deployment_id);
CREATE INDEX idx_time_entries_worker_id ON public.time_entries(worker_id);
CREATE INDEX idx_time_entries_shift_id ON public.time_entries(shift_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON public.worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON public.employer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON public.deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();