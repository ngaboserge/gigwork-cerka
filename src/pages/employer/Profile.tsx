import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Textarea, Badge, Avatar, Rating, Toggle, Tabs, TabsList, TabsTrigger, TabsContent, toast } from '@/components/ui';
import { useAuthStore, useReviewStore } from '@/store';
import { supabase } from '@/lib/supabase';
import type { EmployerProfile } from '@/types';

export function EmployerProfilePage() {
  const { user, updateProfile, updatePreferences } = useAuthStore();
  const { fetchReviewsForUser, reviews } = useReviewStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const profile = user as EmployerProfile & { avatar_url?: string };

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    companyName: profile?.companyName || '',
    companyDescription: profile?.companyDescription || '',
    companyWebsite: profile?.companyWebsite || '',
    industry: profile?.industry || '',
    companyAddress: profile?.companyAddress || '',
  });

  useEffect(() => {
    if (profile?.id) {
      fetchReviewsForUser(profile.id);
    }
  }, [profile?.id]);

  const userReviews = reviews || [];

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast('success', 'Profile updated successfully');
    } catch {
      toast('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 Starting photo upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: profile.id
    });

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast('error', 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('error', 'Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Delete old photo if exists
      if (profile.avatar_url) {
        console.log('🗑️ Deleting old photo...');
        try {
          const urlParts = profile.avatar_url.split('/profile-photos/');
          if (urlParts.length > 1) {
            const oldPath = urlParts[1];
            const { error: deleteError } = await supabase.storage
              .from('profile-photos')
              .remove([oldPath]);
            
            if (deleteError) {
              console.warn('⚠️ Error deleting old photo (continuing anyway):', deleteError);
            } else {
              console.log('✅ Old photo deleted');
            }
          }
        } catch (deleteErr) {
          console.warn('⚠️ Error during delete (continuing):', deleteErr);
        }
      }

      // Upload new photo with timestamp to avoid caching issues
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${profile.id}/avatar-${timestamp}.${fileExt}`;
      
      console.log('⬆️ Uploading to:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);

      // Update profile in database
      console.log('💾 Updating profile with avatar_url...');
      await updateProfile({ avatar_url: publicUrl });
      
      console.log('✅ Profile updated successfully!');
      toast('success', 'Company logo updated!');
    } catch (error: any) {
      console.error('❌ Error uploading photo:', error);
      toast('error', error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!profile) return null;

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar 
                    name={profile?.companyName || profile?.name || 'Company'} 
                    src={profile?.avatar_url}
                    size="xl" 
                  />
                  <label 
                    htmlFor="company-photo-upload" 
                    className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors"
                    title="Change company logo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input
                    id="company-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-neutral-900">{profile.companyName}</h1>
                    {profile.verified === 'verified' && <Badge variant="success">Verified</Badge>}
                  </div>
                  <p className="text-neutral-600">{profile.industry || 'Company'}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Rating value={profile.rating} showValue reviewCount={profile.reviewCount} />
                    <span className="text-sm text-neutral-500">{profile.totalHires} hires</span>
                  </div>
                </div>
              </div>
              <Button variant={isEditing ? 'secondary' : 'primary'} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Company Profile</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({userReviews.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Company Information</h2>
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input label="Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                        <Input label="Industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
                        <Textarea label="Company Description" value={formData.companyDescription} onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })} rows={4} />
                        <Input label="Website" value={formData.companyWebsite} onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })} />
                        <Input label="Address" value={formData.companyAddress} onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })} />
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                          <Button onClick={handleSave} loading={loading}>Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile.companyDescription && <p className="text-neutral-700">{profile.companyDescription}</p>}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-neutral-500">Industry:</span> <span className="text-neutral-900">{profile.industry || 'Not set'}</span></div>
                          <div><span className="text-neutral-500">Company Size:</span> <span className="text-neutral-900">{profile.companySize || 'Not set'}</span></div>
                          <div><span className="text-neutral-500">Website:</span> <span className="text-neutral-900">{profile.companyWebsite || 'Not set'}</span></div>
                          <div><span className="text-neutral-500">Address:</span> <span className="text-neutral-900">{profile.companyAddress || 'Not set'}</span></div>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Contact Person</h2>
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-neutral-500">Name:</span> <span className="text-neutral-900">{profile.name}</span></div>
                        <div><span className="text-neutral-500">Email:</span> <span className="text-neutral-900">{profile.email}</span></div>
                        <div><span className="text-neutral-500">Phone:</span> <span className="text-neutral-900">{profile.phone || 'Not set'}</span></div>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Hiring Stats</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-neutral-600">Jobs Posted</span><span className="font-medium">{profile.totalJobsPosted}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">Total Hires</span><span className="font-medium">{profile.totalHires}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">Response Rate</span><span className="font-medium">{profile.responseRate}%</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">Avg Response Time</span><span className="font-medium">{profile.avgResponseTime}h</span></div>
                    </div>
                  </Card>

                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Verification</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Email</span>
                        <Badge variant={profile.emailVerified ? 'success' : 'warning'}>{profile.emailVerified ? 'Verified' : 'Pending'}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Company</span>
                        <Badge variant={profile.verified === 'verified' ? 'success' : 'warning'}>{profile.verified}</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <h2 className="font-semibold text-neutral-900 mb-4">Reviews from Workers</h2>
                <div className="space-y-4">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-neutral-900">{review.reviewerName}</p>
                          <p className="text-sm text-neutral-500">{review.jobTitle}</p>
                        </div>
                        <Rating value={review.overallRating} size="sm" />
                      </div>
                      {review.title && <p className="font-medium text-neutral-800 mb-1">{review.title}</p>}
                      <p className="text-sm text-neutral-700">{review.content}</p>
                    </div>
                  ))}
                  {userReviews.length === 0 && <p className="text-neutral-500 text-center py-8">No reviews yet</p>}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Platform Preference</h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Choose which features you want to see. You can change this anytime.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.href = '/platform-selection'}
                      className="w-full p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">Current: {
                            user?.platform_preference === 'gigwork' ? 'Gig Work Only' :
                            user?.platform_preference === 'marketplace' ? 'Marketplace Only' :
                            'Full Platform (Both)'
                          }</p>
                          <p className="text-sm text-neutral-500 mt-1">
                            {user?.platform_preference === 'gigwork' && 'You only see gig work features'}
                            {user?.platform_preference === 'marketplace' && 'You only see marketplace features'}
                            {user?.platform_preference === 'both' && 'You see all features'}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                    <p className="text-xs text-neutral-500">
                      💡 Tip: Use the Platform Switcher icon in the header to quickly change your preference
                    </p>
                  </div>
                </Card>

                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <Toggle checked={profile.preferences?.emailNotifications ?? true} onChange={(v) => updatePreferences({ emailNotifications: v })} label="Email Notifications" description="Receive updates via email" />
                    <Toggle checked={profile.preferences?.applicationAlerts ?? true} onChange={(v) => updatePreferences({ applicationAlerts: v })} label="Application Alerts" description="Get notified when workers apply to your jobs" />
                    <Toggle checked={profile.preferences?.messageAlerts ?? true} onChange={(v) => updatePreferences({ messageAlerts: v })} label="Message Alerts" description="Get notified when you receive new messages" />
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
