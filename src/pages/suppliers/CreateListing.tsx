import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliersStore, useMaterialsStore, useAuthStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { toast } from '../../components/ui/Toast';
import { 
  ArrowLeft, DollarSign, Package, Truck, Building, Wheat, Meat, Smartphone, 
  Car, Home as HomeIcon, Tool, Cow, Lightning, Hammer, Box, Hospital, Tractor, Shirt, Camera
} from '../../lib/icons';
import type { ListingForm } from '../../types/materials.types';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { materials, fetchMaterials } = useMaterialsStore();
  const { createListing, loading } = useSuppliersStore();

  const [formData, setFormData] = useState<Partial<ListingForm>>({
    photos: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [showCustomMaterial, setShowCustomMaterial] = useState(false);
  const [customMaterialName, setCustomMaterialName] = useState('');
  const [customMaterialUnit, setCustomMaterialUnit] = useState('');
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [customMaterialDescription, setCustomMaterialDescription] = useState('');
  const [creatingCustomMaterial, setCreatingCustomMaterial] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Force re-render of input
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Group materials by sector
  const sectors = [
    { value: 'construction', label: 'Construction', icon: <Building className="w-4 h-4" /> },
    { value: 'agriculture', label: 'Agriculture', icon: <Wheat className="w-4 h-4" /> },
    { value: 'food', label: 'Food & Commodities', icon: <Meat className="w-4 h-4" /> },
    { value: 'electronics', label: 'Electronics', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'vehicles', label: 'Vehicles', icon: <Car className="w-4 h-4" /> },
    { value: 'rentals', label: 'House Rentals', icon: <HomeIcon className="w-4 h-4" /> },
    { value: 'services', label: 'Services', icon: <Tool className="w-4 h-4" /> },
    { value: 'livestock', label: 'Livestock', icon: <Cow className="w-4 h-4" /> },
    { value: 'energy', label: 'Energy & Utilities', icon: <Lightning className="w-4 h-4" /> },
    { value: 'hardware', label: 'Hardware & Tools', icon: <Hammer className="w-4 h-4" /> },
    { value: 'goods', label: 'Manufactured Goods', icon: <Box className="w-4 h-4" /> },
    { value: 'health', label: 'Health & Hygiene', icon: <Hospital className="w-4 h-4" /> },
    { value: 'automotive', label: 'Automotive & Transport', icon: <Tractor className="w-4 h-4" /> },
    { value: 'textiles', label: 'Textiles & Tailoring', icon: <Shirt className="w-4 h-4" /> }
  ];

  // Filter materials by selected sector
  const filteredMaterials = selectedSector
    ? materials.filter(m => m.sector === selectedSector)
    : [];

  const updateField = (field: keyof ListingForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (showCustomMaterial) {
      if (!customMaterialName.trim()) newErrors.custom_material_name = 'Material name is required';
      if (!customMaterialUnit) newErrors.custom_material_unit = 'Unit is required';
    } else {
      if (!formData.material_id) newErrors.material_id = 'Material is required';
    }
    
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.location) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCustomMaterial = async () => {
    // Validate custom material fields
    const newErrors: Record<string, string> = {};
    if (!customMaterialName.trim()) newErrors.custom_material_name = 'Material name is required';
    if (!customMaterialUnit) newErrors.custom_material_unit = 'Unit is required';
    if (customMaterialUnit === 'custom' && !customUnitInput.trim()) {
      newErrors.custom_unit_input = 'Please enter a custom unit';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Determine the final unit to use
    const finalUnit = customMaterialUnit === 'custom' ? customUnitInput.trim() : customMaterialUnit;

    setCreatingCustomMaterial(true);
    try {
      // Use the materials service to create the custom material
      const { materialsService } = await import('../../services/materials.service');
      
      const newMaterial = await materialsService.createMaterial({
        name: customMaterialName.trim(),
        unit: finalUnit,
        category: customMaterialDescription || 'Custom',
        sector: selectedSector,
        icon: '📦'
      });

      // Refresh materials list
      await fetchMaterials();
      
      // Select the newly created material
      if (newMaterial && newMaterial.id) {
        updateField('material_id', newMaterial.id);
      }
      
      // Reset custom material form
      setShowCustomMaterial(false);
      setCustomMaterialName('');
      setCustomMaterialUnit('');
      setCustomUnitInput('');
      setCustomMaterialDescription('');
      
      toast('success', 'Material added successfully!');
    } catch (error: any) {
      console.error('Error creating custom material:', error);
      toast('error', error.message || 'Failed to add material');
    } finally {
      setCreatingCustomMaterial(false);
    }
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];

    setUploadingPhotos(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of photoFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('listing-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      toast('error', 'Failed to upload some photos');
      return uploadedUrls; // Return whatever was uploaded successfully
    } finally {
      setUploadingPhotos(false);
    }
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) {
      toast('error', 'No files selected');
      return false;
    }

    // Check total count (existing + new)
    const totalCount = photoFiles.length + newFiles.length;
    if (totalCount > 5) {
      toast('error', `Maximum 5 photos allowed. You can add ${5 - photoFiles.length} more.`);
      return false;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/jpe', 'image/pjpeg'];
    const invalidFiles = newFiles.filter(f => !validTypes.includes(f.type.toLowerCase()));
    if (invalidFiles.length > 0) {
      toast('error', `Invalid file type: ${invalidFiles[0].name}. Only JPEG, PNG, and WebP are allowed.`);
      return false;
    }

    // Validate file sizes
    const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast('error', 'Some files exceed 5MB limit');
      return false;
    }

    // Merge with existing files
    const allFiles = [...photoFiles, ...newFiles];
    setPhotoFiles(allFiles);

    // Create preview URLs for new files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    const allPreviews = [...photoPreview, ...newPreviews];
    setPhotoPreview(allPreviews);

    toast('success', `${newFiles.length} photo(s) added`);
    return true;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (validateAndAddFiles(files)) {
      // Reset input to allow selecting same files again
      e.target.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const removePhoto = (index: number) => {
    const newFiles = photoFiles.filter((_, i) => i !== index);
    const newPreviews = photoPreview.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreview[index]);
    
    setPhotoFiles(newFiles);
    setPhotoPreview(newPreviews);
    
    // Reset file input to allow re-selection
    setFileInputKey(Date.now());
  };

  const handleSubmit = async () => {
    if (!user) {
      toast('error', 'Please log in to create listings');
      return;
    }

    if (!validate()) return;

    try {
      // Upload photos first if any
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        toast('info', 'Uploading photos...');
        photoUrls = await uploadPhotos();
      }

      // Add photo URLs to form data
      const listingData: Partial<ListingForm> = {
        ...formData,
        photos: photoUrls.length > 0 ? photoUrls : undefined
      };

      await createListing(listingData as ListingForm, user.id);
      toast('success', 'Listing created successfully!');
      
      // Clean up preview URLs
      photoPreview.forEach(url => URL.revokeObjectURL(url));
      
      setTimeout(() => {
        navigate('/suppliers/listings');
      }, 2000);
    } catch (error: any) {
      toast('error', error.message || 'Failed to create listing');
    }
  };

  const selectedMaterial = materials.find(m => m.id === formData.material_id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="secondary" size="sm" onClick={() => navigate('/suppliers/listings')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Listings
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Supplier Listing</h1>
        <p className="text-gray-600 mt-1">List your materials for buyers to find</p>
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Buyers will contact you through our messaging system</p>
            <p className="text-xs text-blue-700 mt-1">All communication happens securely within the platform - no need to share phone numbers</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Sector Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector / Category *
            </label>
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                // Reset material selection when sector changes
                updateField('material_id', '');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a sector first...</option>
              {sectors.map(sector => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the sector that best matches your product
            </p>
          </div>

          {/* Material Selection - Only show after sector is selected */}
          {selectedSector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material / Product *
              </label>
              <select
                value={formData.material_id || ''}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomMaterial(true);
                    updateField('material_id', '');
                  } else {
                    setShowCustomMaterial(false);
                    updateField('material_id', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a material...</option>
                {filteredMaterials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} ({material.unit})
                  </option>
                ))}
                <option value="custom" className="font-semibold text-primary-700">
                  Add Custom Material
                </option>
              </select>
              {errors.material_id && (
                <p className="mt-1 text-xs text-red-600">{errors.material_id}</p>
              )}
              {selectedMaterial && !showCustomMaterial && (
                <p className="text-sm text-gray-500 mt-1">
                  Category: {selectedMaterial.category}
                </p>
              )}
            </div>
          )}

          {/* Custom Material Input - Show when user selects "Add Custom Material" */}
          {showCustomMaterial && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Add Your Custom Material
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Can't find your material? Add it here and we'll review it for approval.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name *
                </label>
                <Input
                  placeholder="e.g., Premium Quality Rice"
                  value={customMaterialName}
                  onChange={(e) => setCustomMaterialName(e.target.value)}
                  error={errors.custom_material_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measurement *
                </label>
                <select
                  value={customMaterialUnit}
                  onChange={(e) => {
                    setCustomMaterialUnit(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomUnitInput('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select unit...</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="bag">Bag</option>
                  <option value="piece">Piece</option>
                  <option value="liter">Liter</option>
                  <option value="meter">Meter</option>
                  <option value="box">Box</option>
                  <option value="carton">Carton</option>
                  <option value="dozen">Dozen</option>
                  <option value="ton">Ton</option>
                  <option value="unit">Unit</option>
                  <option value="sqm">Square Meter (sqm)</option>
                  <option value="bundle">Bundle</option>
                  <option value="roll">Roll</option>
                  <option value="pack">Pack</option>
                  <option value="sack">Sack</option>
                  <option value="bottle">Bottle</option>
                  <option value="can">Can</option>
                  <option value="jar">Jar</option>
                  <option value="gallon">Gallon</option>
                  <option value="custom" className="font-semibold text-primary-700">Custom Unit</option>
                </select>
                {errors.custom_material_unit && (
                  <p className="mt-1 text-xs text-red-600">{errors.custom_material_unit}</p>
                )}
              </div>

              {/* Custom Unit Input - Show when "Custom Unit" is selected */}
              {customMaterialUnit === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Custom Unit *
                  </label>
                  <Input
                    placeholder="e.g., tray, crate, pallet, etc."
                    value={customUnitInput}
                    onChange={(e) => setCustomUnitInput(e.target.value)}
                    error={errors.custom_unit_input}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the unit of measurement for your material
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="Describe your material to help us categorize it correctly..."
                  value={customMaterialDescription}
                  onChange={(e) => setCustomMaterialDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowCustomMaterial(false);
                    setCustomMaterialName('');
                    setCustomMaterialUnit('');
                    setCustomUnitInput('');
                    setCustomMaterialDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateCustomMaterial}
                  loading={creatingCustomMaterial}
                >
                  Add Material
                </Button>
              </div>
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per {selectedMaterial?.unit || 'unit'} *
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.price || ''}
              onChange={(e) => updateField('price', parseFloat(e.target.value))}
              icon={<DollarSign className="w-4 h-4" />}
              error={errors.price}
            />
          </div>

          {/* Min Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Quantity (optional)
            </label>
            <Input
              type="number"
              placeholder="e.g., 10"
              value={formData.min_quantity || ''}
              onChange={(e) => updateField('min_quantity', parseFloat(e.target.value))}
              icon={<Package className="w-4 h-4" />}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if there's no minimum order quantity
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <select
              value={formData.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select location...</option>
              <option value="Kigali">Kigali</option>
              <option value="Huye">Huye</option>
              <option value="Musanze">Musanze</option>
              <option value="Rubavu">Rubavu</option>
              <option value="Muhanga">Muhanga</option>
            </select>
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location}</p>
            )}
          </div>

          {/* City & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District (optional)
              </label>
              <Input
                placeholder="e.g., Gasabo"
                value={formData.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector (optional)
              </label>
              <Input
                placeholder="e.g., Kimironko"
                value={formData.area || ''}
                onChange={(e) => updateField('area', e.target.value)}
              />
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Information
            </label>
            <Textarea
              placeholder="e.g., Free delivery within 10km, delivery available nationwide"
              value={formData.delivery_info || ''}
              onChange={(e) => updateField('delivery_info', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              <Truck className="w-3 h-3 inline mr-1" />
              Describe your delivery options and coverage area
            </p>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional)
            </label>
            <div className="text-sm text-gray-600 mb-2 bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-2">
              <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Photos are optional but recommended!</p>
                <p className="text-xs text-amber-700 mt-1">Listings with photos get 3x more inquiries. You can add photos later if needed.</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Supported formats: JPG, PNG, WEBP • Max 5MB per photo • Up to 5 photos
            </p>
            
            {/* Photo Preview */}
            {photoPreview.length > 0 && (
              <div className="mb-3">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {photoPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-600">
                  ✓ {photoFiles.length} photo(s) selected {photoFiles.length < 5 && `• You can add ${5 - photoFiles.length} more`}
                </p>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDragging 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }
                ${photoFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <input
                key={fileInputKey}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/jpe,image/pjpeg,.jpg,.jpeg,.png,.webp"
                multiple
                onChange={handlePhotoSelect}
                disabled={photoFiles.length >= 5}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              
              <div className="pointer-events-none">
                <Camera className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
                {photoFiles.length >= 5 ? (
                  <p className="text-sm text-gray-500 font-medium">Maximum 5 photos reached</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {isDragging ? 'Drop photos here' : 'Drag & drop photos here'}
                    </p>
                    <p className="text-xs text-gray-500">
                      or click to browse • Select multiple files at once
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Add More Photos Button - Only show if photos exist and under limit */}
            {photoFiles.length > 0 && photoFiles.length < 5 && (
              <div className="mt-3">
                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/jpe,image/pjpeg,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add More Photos ({5 - photoFiles.length} remaining)
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/suppliers/listings')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading || uploadingPhotos}>
            {uploadingPhotos ? 'Uploading Photos...' : 'Create Listing'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
