import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMaterialsStore, usePriceSubmissionsStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { FileUpload } from '../../components/ui/FileUpload';
import { toast } from '../../components/ui/Toast';
import { MapPin, Camera, DollarSign, Package } from '../../lib/icons';

export default function PriceSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { materials, fetchMaterials } = useMaterialsStore();
  const { currentSubmission, setCurrentSubmission, submitPrice, loading } = usePriceSubmissionsStore();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null); // Store the actual File object

  useEffect(() => {
    fetchMaterials();
    
    // Pre-select material if passed from dashboard
    if (location.state?.materialId) {
      setCurrentSubmission({ material_id: location.state.materialId });
    }
  }, []);

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!currentSubmission.material_id) {
        newErrors.material_id = t('materials.submit.selectMaterialError');
      }
    }

    if (stepNumber === 2) {
      if (!currentSubmission.price || currentSubmission.price <= 0) {
        newErrors.price = t('materials.submit.priceError');
      }
      if (!currentSubmission.location) {
        newErrors.location = t('materials.submit.locationError');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast('error', t('materials.submit.loginRequired'));
      return;
    }

    if (!validateStep(2)) return;

    try {
      // Only add photo if one was selected
      if (photoFile) {
        setCurrentSubmission({ photo: photoFile as any });
      }
      
      await submitPrice(user.id);
      toast('success', t('materials.submit.submitSuccess'));
      
      // Reset form
      setPhotoFile(null);
      setCurrentSubmission({});
      
      setTimeout(() => {
        navigate('/materials/trends');
      }, 1500);
    } catch (error: any) {
      toast('error', error.message || t('materials.submit.submitError'));
    }
  };

  const selectedMaterial = materials.find(m => m.id === currentSubmission.material_id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('materials.submit.title')}</h1>
        <p className="text-gray-600 mt-2">{t('materials.submit.subtitle')}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
      </div>

      <Card className="p-6">
        {/* Step 1: Material Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('materials.submit.selectMaterial')}</h2>
            <select
              value={currentSubmission.material_id || ''}
              onChange={(e) => setCurrentSubmission({ material_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">{t('materials.submit.chooseMaterial')}</option>
              {materials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.name} ({material.unit})
                </option>
              ))}
            </select>

            {selectedMaterial && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>{t('materials.submit.category')}:</strong> {selectedMaterial.category}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{t('materials.submit.unit')}:</strong> {selectedMaterial.unit}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext} disabled={!currentSubmission.material_id}>
                {t('materials.submit.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Price & Location */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('materials.submit.priceDetails')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('materials.submit.pricePer')} {selectedMaterial?.unit} *
                </label>
                <Input
                  type="number"
                  placeholder={t('materials.submit.pricePlaceholder')}
                  value={currentSubmission.price || ''}
                  onChange={(e) => setCurrentSubmission({ price: parseFloat(e.target.value) })}
                  icon={<DollarSign className="w-4 h-4" />}
                  error={errors.price}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('materials.submit.quantity')}
                </label>
                <Input
                  type="number"
                  placeholder={t('materials.submit.quantityPlaceholder')}
                  value={currentSubmission.quantity || ''}
                  onChange={(e) => setCurrentSubmission({ quantity: parseFloat(e.target.value) })}
                  icon={<Package className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('materials.submit.location')} *
                </label>
                <Input
                  placeholder={t('materials.submit.locationPlaceholder')}
                  value={currentSubmission.location || ''}
                  onChange={(e) => setCurrentSubmission({ location: e.target.value })}
                  icon={<MapPin className="w-4 h-4" />}
                  error={errors.location}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('materials.submit.locationHelp')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={handleBack}>
                {t('materials.submit.back')}
              </Button>
              <Button onClick={handleNext}>
                {t('materials.submit.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Optional Details */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('materials.submit.additionalDetails')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('materials.submit.photo')}
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file size (10MB max)
                        if (file.size > 10 * 1024 * 1024) {
                          toast('error', t('materials.submit.photoSizeError'));
                          e.target.value = '';
                          return;
                        }
                        // Validate file type
                        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                        if (!validTypes.includes(file.type)) {
                          toast('error', t('materials.submit.photoTypeError'));
                          e.target.value = '';
                          return;
                        }
                        setPhotoFile(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                  />
                  {photoFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Camera className="w-4 h-4" />
                      <span>{photoFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setPhotoFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        {t('materials.submit.remove')}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('materials.submit.photoHelp')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('materials.submit.notes')}
                </label>
                <Textarea
                  placeholder={t('materials.submit.notesPlaceholder')}
                  value={currentSubmission.notes || ''}
                  onChange={(e) => setCurrentSubmission({ notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={handleBack}>
                {t('materials.submit.back')}
              </Button>
              <Button onClick={handleSubmit} loading={loading}>
                {t('materials.submit.submitPrice')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="mt-6 p-4 bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-2">{t('materials.submit.whySubmit')}</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('materials.submit.helpOthers')}</li>
          <li>• {t('materials.submit.buildScore')}</li>
          <li>• {t('materials.submit.contributeData')}</li>
          <li>• {t('materials.submit.getRecognized')}</li>
        </ul>
      </Card>
    </div>
  );
}
