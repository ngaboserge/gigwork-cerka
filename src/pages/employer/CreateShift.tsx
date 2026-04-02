import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Select, Textarea, Toggle } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { shiftsService } from '@/services/shifts.service';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import type { ShiftCategory, PayType, UrgencyLevel } from '@/lib/database.types';

const CATEGORIES = [
  { value: 'events', label: 'Events & Hospitality' },
  { value: 'warehouse', label: 'Warehouse & Logistics' },
  { value: 'hospitality', label: 'Food Service' },
  { value: 'industrial', label: 'Industrial & Manufacturing' },
  { value: 'facilities', label: 'Facilities & Cleaning' },
];

const URGENCY_OPTIONS = [
  { value: 'normal', label: 'Normal', description: 'Standard posting' },
  { value: 'urgent', label: 'Urgent', description: 'Need workers soon' },
  { value: 'critical', label: 'Critical', description: 'Emergency staffing' },
];

export function CreateShift() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'events',
    location_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    break_minutes: 0,
    slots_needed: 1,
    pay_rate: '',
    pay_type: 'hourly' as 'hourly' | 'daily' | 'fixed',
    urgency: 'normal' as 'normal' | 'urgent' | 'critical',
    dress_code: '',
    special_instructions: '',
    auto_confirm_enabled: true,
    minimum_reliability_score: 50,
  });

  // Calculate overbooking preview
  const calculateOverbooking = () => {
    const baseRate = 0.08; // 8% default no-show rate
    const urgencyBuffer = formData.urgency === 'critical' ? 5 : formData.urgency === 'urgent' ? 2 : 0;
    const overbooking = Math.ceil(formData.slots_needed * baseRate * 1.2) + urgencyBuffer;
    return {
      overbooking,
      total: formData.slots_needed + overbooking,
    };
  };

  const { overbooking, total } = calculateOverbooking();

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('You must be logged in to create a shift');
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Check authentication
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('🔐 Auth Debug:', {
        storeUserId: user.id,
        authUserId: authUser?.id,
        match: user.id === authUser?.id,
        authUser: authUser,
      });

      if (!authUser) {
        alert('Authentication error: Please log out and log back in');
        setIsSubmitting(false);
        return;
      }

      // IMPORTANT: Use the actual authenticated user ID, not the store
      // The store might have stale data
      const employerId = authUser.id;

      // Calculate overbooking and total slots
      const baseRate = 0.08; // 8% default no-show rate
      const urgencyBuffer = formData.urgency === 'critical' ? 5 : formData.urgency === 'urgent' ? 2 : 0;
      const overbookingSlots = Math.ceil(formData.slots_needed * baseRate * 1.2) + urgencyBuffer;
      const totalSlots = formData.slots_needed + overbookingSlots;
      const overbookingPercent = Math.round((overbookingSlots / formData.slots_needed) * 100);

      // Prepare shift data
      const shiftData: any = {
        employer_id: employerId,
        title: formData.title,
        description: formData.description,
        category: formData.category as ShiftCategory,
        location_name: formData.location_name,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
        },
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        shift_date: formData.shift_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_minutes: formData.break_minutes,
        slots_needed: formData.slots_needed,
        slots_total: totalSlots,
        overbooking_percent: overbookingPercent,
        pay_rate: parseFloat(formData.pay_rate),
        pay_type: formData.pay_type as PayType,
        urgency: formData.urgency as UrgencyLevel,
        dress_code: formData.dress_code || null,
        special_instructions: formData.special_instructions || null,
        auto_confirm_enabled: formData.auto_confirm_enabled,
        auto_confirm_reliability_threshold: formData.minimum_reliability_score,
        minimum_reliability_score: formData.minimum_reliability_score,
        required_certifications: [],
        equipment_provided: [],
      };

      // If publishing, set status to 'open' directly
      if (publish) {
        shiftData.status = 'open';
        shiftData.published_at = new Date().toISOString();
      }

      const shift = await shiftsService.createShift(shiftData);
      
      navigate('/employer/shifts');
    } catch (error: any) {
      console.error('Error creating shift:', error);
      alert(error.message || 'Failed to create shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-neutral-900">Post a Shift</h1>
            <p className="text-neutral-600 mt-1">Create a new shift and deploy workers</p>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Shift Details</h2>
              <div className="space-y-4">
                <Input
                  label="Shift Title"
                  placeholder="e.g., Warehouse Associate, Event Setup Crew"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    options={CATEGORIES}
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Urgency</label>
                    <div className="flex gap-2">
                      {URGENCY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('urgency', opt.value)}
                          className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                            formData.urgency === opt.value
                              ? opt.value === 'critical' ? 'bg-red-50 border-red-300 text-red-700' :
                                opt.value === 'urgent' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                                'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Textarea
                  label="Description"
                  placeholder="Describe the work, responsibilities, and any important details..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
            </Card>

            {/* Location */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Location</h2>
              <div className="space-y-4">
                <Input
                  label="Venue / Location Name"
                  placeholder="e.g., Convention Center, Main Warehouse"
                  value={formData.location_name}
                  onChange={(e) => updateField('location_name', e.target.value)}
                  required
                />
                <Input
                  label="Street Address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    required
                  />
                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    value={formData.zip_code}
                    onChange={(e) => updateField('zip_code', e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Date & Time */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Date & Time</h2>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Shift Date"
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => updateField('shift_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => updateField('start_time', e.target.value)}
                  required
                />
                <Input
                  label="End Time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => updateField('end_time', e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Break Duration (minutes)"
                  type="number"
                  value={formData.break_minutes}
                  onChange={(e) => updateField('break_minutes', parseInt(e.target.value) || 0)}
                  min={0}
                  max={120}
                />
              </div>
            </Card>

            {/* Workers & Pay - THE KEY SECTION */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Workers & Compensation</h2>
              
              {/* Workers Needed - Prominent */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  How many workers do you need?
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => updateField('slots_needed', Math.max(1, formData.slots_needed - 1))}
                      className="px-4 py-3 text-neutral-600 hover:bg-neutral-50 border-r border-neutral-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={formData.slots_needed}
                      onChange={(e) => updateField('slots_needed', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center text-2xl font-bold py-2 border-0 focus:ring-0"
                      min={1}
                    />
                    <button
                      type="button"
                      onClick={() => updateField('slots_needed', formData.slots_needed + 1)}
                      className="px-4 py-3 text-neutral-600 hover:bg-neutral-50 border-l border-neutral-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-neutral-600">worker{formData.slots_needed !== 1 ? 's' : ''}</span>
                  
                  {/* Quick select buttons */}
                  <div className="flex gap-2 ml-4">
                    {[1, 5, 10, 25, 50].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateField('slots_needed', num)}
                        className={`px-3 py-1 text-sm rounded-full border ${
                          formData.slots_needed === num
                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overbooking info - only show for larger deployments */}
                {formData.slots_needed >= 5 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium">Smart Overbooking Enabled</p>
                        <p className="text-blue-700">
                          We'll confirm {total} workers ({overbooking} standby) to ensure you get {formData.slots_needed} on shift day.
                          Standby workers are compensated at 25% if not needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Pay Rate</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 rounded-l-lg">
                      RWF
                    </span>
                    <input
                      type="number"
                      value={formData.pay_rate}
                      onChange={(e) => updateField('pay_rate', e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                    <select
                      value={formData.pay_type}
                      onChange={(e) => updateField('pay_type', e.target.value)}
                      className="border border-l-0 border-neutral-300 bg-neutral-50 px-3 rounded-r-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="hourly">/hour</option>
                      <option value="daily">/day</option>
                      <option value="fixed">fixed</option>
                    </select>
                  </div>
                </div>
                
                {/* Estimated cost preview */}
                {formData.pay_rate && formData.start_time && formData.end_time && (
                  <div className="flex items-end">
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg w-full">
                      <p className="text-xs text-neutral-500">Estimated Total Cost</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatCurrency((() => {
                          const rate = parseFloat(formData.pay_rate) || 0;
                          if (formData.pay_type === 'hourly') {
                            const start = formData.start_time.split(':').map(Number);
                            const end = formData.end_time.split(':').map(Number);
                            const hours = (end[0] + end[1]/60) - (start[0] + start[1]/60) - (formData.break_minutes / 60);
                            return rate * hours * total;
                          }
                          return rate * total;
                        })())}
                      </p>
                      <p className="text-xs text-neutral-500">for {total} workers (incl. standby)</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-lg font-semibold text-neutral-900">Advanced Settings</h2>
                <svg 
                  className={`w-5 h-5 text-neutral-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">Auto-Confirm Workers</p>
                      <p className="text-sm text-neutral-500">
                        Automatically confirm workers with high reliability scores
                      </p>
                    </div>
                    <Toggle
                      checked={formData.auto_confirm_enabled}
                      onChange={(checked) => updateField('auto_confirm_enabled', checked)}
                    />
                  </div>

                  {formData.auto_confirm_enabled && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Minimum Reliability Score for Auto-Confirm
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="50"
                          max="95"
                          step="5"
                          value={formData.minimum_reliability_score}
                          onChange={(e) => updateField('minimum_reliability_score', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-medium">{formData.minimum_reliability_score}%</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Workers below this score will require manual approval
                      </p>
                    </div>
                  )}

                  <Input
                    label="Dress Code"
                    placeholder="e.g., Black pants, closed-toe shoes"
                    value={formData.dress_code}
                    onChange={(e) => updateField('dress_code', e.target.value)}
                  />

                  <Textarea
                    label="Special Instructions"
                    placeholder="Parking info, entry instructions, what to bring..."
                    value={formData.special_instructions}
                    onChange={(e) => updateField('special_instructions', e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/employer/shifts')}
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Shift'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
