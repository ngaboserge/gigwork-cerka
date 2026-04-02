import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Textarea, Badge, Avatar, Rating, Toggle, Tabs, TabsList, TabsTrigger, TabsContent, toast } from '@/components/ui';
import { useAuthStore, useReviewStore } from '@/store';
import { verificationService, KYCVerification } from '@/services/verification.service';
import { SingleVerificationBadge } from '@/components/SingleVerificationBadge';
import { formatCurrency } from '@/lib/currency';
import { supabase } from '@/lib/supabase';
import { Camera } from '@/lib/icons';
import type { EmployeeProfile } from '@/types';

export function EmployeeProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { reviews, fetchReviewsForUser } = useReviewStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [verification, setVerification] = useState<KYCVerification | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  // Use type assertion that preserves avatar_url from authStore
  const profile = user as EmployeeProfile & { avatar_url?: string };

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    hourlyRate: profile?.hourlyRate?.toString() || '',
    dailyRate: profile?.dailyRate?.toString() || '',
  });

  useEffect(() => {
    if (profile) {
      fetchReviewsForUser(profile.id);
      loadVerificationStatus();
    }
  }, [profile?.id, fetchReviewsForUser]);

  const loadVerificationStatus = async () => {
    if (!profile) return;
    const verificationData = await verificationService.getVerificationStatus();
    setVerification(verificationData);
    
    if (verificationData?.status === 'approved') {
      const userBadges = await verificationService.getVerificationBadges(profile.id);
      setBadges(userBadges);
    }
  };

  const userReviews = reviews;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

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
          // Extract the path from the URL
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
          upsert: false // Don't upsert, create new file each time
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ Upload successful:', uploadData);

      // Verify the file was actually uploaded by trying to download it
      console.log('🔍 Verifying upload...');
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('profile-photos')
        .download(fileName);
      
      if (downloadError || !downloadData) {
        console.error('❌ Verification failed - file not found after upload:', downloadError);
        throw new Error('Upload verification failed. File may not have been saved.');
      }
      
      console.log('✅ Upload verified - file exists:', downloadData.size, 'bytes');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);

      // Update profile in database
      console.log('💾 Updating profile with avatar_url...');
      await updateProfile({ avatar_url: publicUrl });
      
      console.log('✅ Profile updated successfully!');
      toast('success', 'Profile photo updated!');
    } catch (error: any) {
      console.error('❌ Error uploading photo:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        hint: error.hint
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to upload photo';
      if (error.message?.includes('bucket not configured')) {
        errorMessage = 'Storage not set up. Please contact support.';
      } else if (error.message?.includes('verification failed')) {
        errorMessage = 'Upload failed - file could not be saved. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast('error', errorMessage);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile?.avatar_url) return;
    
    if (!confirm('Remove profile photo?')) return;

    setUploadingPhoto(true);
    try {
      // Delete from storage
      const oldPath = profile.avatar_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('profile-photos')
          .remove([`${profile.id}/${oldPath}`]);
      }

      // Update profile
      await updateProfile({ avatar_url: null });
      
      toast('success', 'Profile photo removed');
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast('error', 'Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
      });
      setIsEditing(false);
      toast('success', 'Profile updated successfully');
    } catch {
      toast('error', 'Failed to update profile');
    } finally {
      setLoading(false);
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
                <div className="relative group">
                  <Avatar 
                    name={profile.name} 
                    size="xl" 
                    src={profile.avatar_url || undefined}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition flex items-center justify-center">
                    <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                      <div className="bg-white rounded-full p-2">
                        {uploadingPhoto ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                        ) : (
                          <Camera className="w-5 h-5 text-gray-700" />
                        )}
                      </div>
                    </label>
                  </div>
                  {profile.avatar_url && !uploadingPhoto && (
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      title="Remove photo"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-neutral-900">{profile.name}</h1>
                    {verification?.status === 'approved' && (
                      <Badge variant="success">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        ID Verified
                      </Badge>
                    )}
                    {badges.map((badge) => (
                      <SingleVerificationBadge key={badge} type={badge} size="md" />
                    ))}
                  </div>
                  <p className="text-neutral-600">{profile.headline || 'Worker'}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Rating value={profile.rating} showValue reviewCount={profile.reviewCount} />
                    <span className="text-sm text-neutral-500">{profile.completedJobs} jobs completed</span>
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
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({userReviews.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Basic Information</h2>
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <Input label="Headline" value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} placeholder="e.g., Experienced Warehouse Professional" />
                        <Textarea label="Bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="Tell employers about yourself..." />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                          <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Hourly Rate (RWF)" type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })} />
                          <Input label="Daily Rate (RWF)" type="number" value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                          <Button onClick={handleSave} loading={loading}>Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile.bio && <p className="text-neutral-700">{profile.bio}</p>}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-neutral-500">Email:</span> <span className="text-neutral-900">{profile.email}</span></div>
                          <div><span className="text-neutral-500">Phone:</span> <span className="text-neutral-900">{profile.phone || 'Not set'}</span></div>
                          <div><span className="text-neutral-500">Location:</span> <span className="text-neutral-900">{profile.location || 'Not set'}</span></div>
                          <div><span className="text-neutral-500">Availability:</span> <Badge variant={profile.availability === 'available' ? 'success' : profile.availability === 'busy' ? 'warning' : 'neutral'}>{profile.availability}</Badge></div>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Rates</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-neutral-50 border border-neutral-200">
                        <p className="text-2xl font-bold text-primary-800">{formatCurrency(profile.hourlyRate || 0)}</p>
                        <p className="text-sm text-neutral-600">per hour</p>
                      </div>
                      <div className="text-center p-4 bg-neutral-50 border border-neutral-200">
                        <p className="text-2xl font-bold text-primary-800">{formatCurrency(profile.dailyRate || 0)}</p>
                        <p className="text-sm text-neutral-600">per day</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Stats</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-neutral-600">Jobs Completed</span><span className="font-medium">{profile.completedJobs}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">Total Earnings</span><span className="font-medium">{formatCurrency(profile.totalEarnings || 0)}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">Response Rate</span><span className="font-medium">{profile.responseRate}%</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">Reliability Score</span><span className="font-medium">{profile.reliabilityScore}%</span></div>
                    </div>
                  </Card>

                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Identity Verification</h2>
                    
                    {/* KYC Verification Status */}
                    <div className="mb-4 p-4 rounded-lg border-2 border-dashed" style={{
                      borderColor: verification?.status === 'approved' ? '#10b981' : 
                                   verification?.status === 'pending' ? '#f59e0b' : 
                                   verification?.status === 'rejected' ? '#ef4444' : '#d1d5db',
                      backgroundColor: verification?.status === 'approved' ? '#f0fdf4' : 
                                      verification?.status === 'pending' ? '#fffbeb' : 
                                      verification?.status === 'rejected' ? '#fef2f2' : '#f9fafb'
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">National ID Verification</span>
                        <Badge variant={
                          verification?.status === 'approved' ? 'success' : 
                          verification?.status === 'pending' ? 'warning' : 
                          verification?.status === 'rejected' ? 'error' : 'neutral'
                        }>
                          {verification?.status === 'approved' ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </>
                          ) : verification?.status === 'pending' ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Under Review
                            </>
                          ) : verification?.status === 'rejected' ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Rejected
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                              </svg>
                              Not Started
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      {verification?.status === 'approved' && verification.approved_at && (
                        <p className="text-xs text-neutral-600">
                          Verified on {new Date(verification.approved_at).toLocaleDateString()}
                        </p>
                      )}
                      
                      {verification?.status === 'pending' && (
                        <p className="text-xs text-neutral-600">
                          Your verification is being reviewed by our team. This usually takes 24-48 hours.
                        </p>
                      )}
                      
                      {verification?.status === 'rejected' && verification.rejection_reason && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-red-700">Reason:</p>
                          <p className="text-xs text-red-600">{verification.rejection_reason}</p>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="mt-2"
                            onClick={() => window.location.href = '/employee/verification'}
                          >
                            Resubmit Verification
                          </Button>
                        </div>
                      )}
                      
                      {!verification && (
                        <Button 
                          size="sm" 
                          variant="primary" 
                          className="mt-2 w-full"
                          onClick={() => window.location.href = '/employee/verification'}
                        >
                          Start ID Verification
                        </Button>
                      )}
                    </div>

                    {/* Verification Badges */}
                    {badges.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-neutral-600 mb-2">Earned Badges:</p>
                        <div className="flex flex-wrap gap-2">
                          {badges.map((badge) => (
                            <SingleVerificationBadge key={badge} type={badge} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Verifications */}
                    <div className="space-y-3 pt-3 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Email</span>
                        <Badge variant={profile.emailVerified ? 'success' : 'warning'}>{profile.emailVerified ? 'Verified' : 'Pending'}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Phone</span>
                        <Badge variant={profile.phoneVerified ? 'success' : 'warning'}>{profile.phoneVerified ? 'Verified' : 'Pending'}</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-neutral-900">Skills</h2>
                    <Button size="sm" variant="secondary">Add Skill</Button>
                  </div>
                  <div className="space-y-3">
                    {profile.skills?.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{skill.name}</span>
                            {skill.verified && <Badge variant="success" className="text-xs">Verified</Badge>}
                          </div>
                          <p className="text-xs text-neutral-500">{skill.level} - {skill.yearsOfExperience} years</p>
                        </div>
                        <span className="text-sm text-neutral-500">{skill.endorsements} endorsements</span>
                      </div>
                    ))}
                    {(!profile.skills || profile.skills.length === 0) && (
                      <p className="text-neutral-500 text-center py-4">No skills added yet</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-neutral-900">Work Experience</h2>
                    <Button size="sm" variant="secondary">Add Experience</Button>
                  </div>
                  <div className="space-y-4">
                    {profile.experience?.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-primary-200 pl-4">
                        <h3 className="font-medium text-neutral-900">{exp.title}</h3>
                        <p className="text-sm text-neutral-600">{exp.company}</p>
                        <p className="text-xs text-neutral-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                        {exp.description && <p className="text-sm text-neutral-700 mt-2">{exp.description}</p>}
                      </div>
                    ))}
                    {(!profile.experience || profile.experience.length === 0) && (
                      <p className="text-neutral-500 text-center py-4">No experience added yet</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-neutral-900">Certifications</h2>
                    <Button size="sm" variant="secondary">Add Certification</Button>
                  </div>
                  <div className="space-y-3">
                    {profile.certifications?.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{cert.name}</span>
                            {cert.verified && <Badge variant="success" className="text-xs">Verified</Badge>}
                          </div>
                          <p className="text-xs text-neutral-500">{cert.issuer}</p>
                        </div>
                        {cert.expiryDate && (
                          <span className="text-xs text-neutral-500">Expires: {cert.expiryDate}</span>
                        )}
                      </div>
                    ))}
                    {(!profile.certifications || profile.certifications.length === 0) && (
                      <p className="text-neutral-500 text-center py-4">No certifications added yet</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-neutral-900">Languages</h2>
                    <Button size="sm" variant="secondary">Add Language</Button>
                  </div>
                  <div className="space-y-2">
                    {profile.languages?.map((lang, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <span className="text-neutral-900">{lang.language}</span>
                        <Badge variant="neutral">{lang.proficiency}</Badge>
                      </div>
                    ))}
                    {(!profile.languages || profile.languages.length === 0) && (
                      <p className="text-neutral-500 text-center py-4">No languages added yet</p>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <h2 className="font-semibold text-neutral-900 mb-4">Reviews from Employers</h2>
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
                  {userReviews.length === 0 && (
                    <p className="text-neutral-500 text-center py-8">No reviews yet</p>
                  )}
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
                    <Toggle checked={profile.preferences?.pushNotifications ?? true} onChange={(v) => updatePreferences({ pushNotifications: v })} label="Push Notifications" description="Receive browser notifications" />
                    <Toggle checked={profile.preferences?.jobAlerts ?? true} onChange={(v) => updatePreferences({ jobAlerts: v })} label="Job Alerts" description="Get notified about new jobs matching your preferences" />
                    <Toggle checked={profile.preferences?.messageAlerts ?? true} onChange={(v) => updatePreferences({ messageAlerts: v })} label="Message Alerts" description="Get notified when you receive new messages" />
                  </div>
                </Card>

                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Display Preferences</h2>
                  <Toggle checked={profile.preferences?.darkMode ?? false} onChange={(v) => updatePreferences({ darkMode: v })} label="Dark Mode" description="Use dark theme throughout the app" />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
