import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Textarea, Badge, Avatar, Tabs, TabsList, TabsTrigger, TabsContent, toast, Toggle } from '@/components/ui';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { Camera } from '@/lib/icons';

export function MarketplaceProfile() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    businessName: user?.business_name || '',
    businessType: user?.business_type || '',
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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
      if (user.avatar_url) {
        try {
          const urlParts = user.avatar_url.split('/profile-photos/');
          if (urlParts.length > 1) {
            const oldPath = urlParts[1];
            await supabase.storage.from('profile-photos').remove([oldPath]);
          }
        } catch (deleteErr) {
          console.warn('Error during delete:', deleteErr);
        }
      }

      // Upload new photo
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/avatar-${timestamp}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });
      
      toast('success', 'Profile photo updated!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast('error', error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.avatar_url) return;
    
    if (!confirm('Remove profile photo?')) return;

    setUploadingPhoto(true);
    try {
      const oldPath = user.avatar_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('profile-photos')
          .remove([`${user.id}/${oldPath}`]);
      }

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
        bio: formData.bio,
        business_name: formData.businessName,
        business_type: formData.businessType,
      });
      setIsEditing(false);
      toast('success', 'Profile updated successfully');
    } catch {
      toast('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar 
                    name={user.name} 
                    size="xl" 
                    src={user.avatar_url || undefined}
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
                  {user.avatar_url && !uploadingPhoto && (
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
                  <h1 className="text-xl font-bold text-neutral-900">{user.name}</h1>
                  <p className="text-neutral-600">{user.business_name || 'Marketplace User'}</p>
                  <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
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
              <TabsTrigger value="business">Business Info</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Personal Information</h2>
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input 
                          label="Full Name" 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        />
                        <Textarea 
                          label="Bio" 
                          value={formData.bio} 
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                          rows={4} 
                          placeholder="Tell others about yourself..." 
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Phone" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                          />
                          <Input 
                            label="Location" 
                            value={formData.location} 
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                          <Button onClick={handleSave} loading={loading}>Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {user.bio && <p className="text-neutral-700">{user.bio}</p>}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-neutral-500">Email:</span> <span className="text-neutral-900">{user.email}</span></div>
                          <div><span className="text-neutral-500">Phone:</span> <span className="text-neutral-900">{user.phone || 'Not set'}</span></div>
                          <div><span className="text-neutral-500">Location:</span> <span className="text-neutral-900">{user.location || 'Not set'}</span></div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Account Type</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Role</span>
                        <Badge variant="primary">{user.role}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Platform</span>
                        <Badge variant="success">Marketplace</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h2 className="font-semibold text-neutral-900 mb-4">Verification</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Email</span>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Phone</span>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <h2 className="font-semibold text-neutral-900 mb-4">Business Information</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <Input 
                      label="Business Name" 
                      value={formData.businessName} 
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} 
                      placeholder="Your business or company name"
                    />
                    <Input 
                      label="Business Type" 
                      value={formData.businessType} 
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} 
                      placeholder="e.g., Supplier, Buyer, Trader"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-neutral-500">Business Name:</span> <span className="text-neutral-900">{user.business_name || 'Not set'}</span></div>
                      <div><span className="text-neutral-500">Business Type:</span> <span className="text-neutral-900">{user.business_type || 'Not set'}</span></div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Marketplace Features</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Create and manage product listings</li>
                        <li>• Request quotes from suppliers</li>
                        <li>• Track price trends and market intelligence</li>
                        <li>• Browse 14 product categories</li>
                      </ul>
                    </div>
                  </div>
                )}
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
                    <Toggle 
                      checked={true} 
                      onChange={() => {}} 
                      label="Email Notifications" 
                      description="Receive updates via email" 
                    />
                    <Toggle 
                      checked={true} 
                      onChange={() => {}} 
                      label="Quote Alerts" 
                      description="Get notified about quote requests and responses" 
                    />
                    <Toggle 
                      checked={true} 
                      onChange={() => {}} 
                      label="Price Alerts" 
                      description="Get notified about significant price changes" 
                    />
                    <Toggle 
                      checked={true} 
                      onChange={() => {}} 
                      label="Message Alerts" 
                      description="Get notified when you receive new messages" 
                    />
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
