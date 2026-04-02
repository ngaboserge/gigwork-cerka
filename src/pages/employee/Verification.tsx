import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Button, Card, Input } from '@/components/ui';
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload';
import { verificationService, RwandaIDValidation } from '@/services/verification.service';
import { useAuthStore } from '@/store';

type Step = 'status' | 'upload-id' | 'selfie' | 'details' | 'review' | 'submitted';

export function Verification() {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>('status');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Verification status
  const [verification, setVerification] = useState<any>(null);
  
  // Form data
  const [idFront, setIdFront] = useState<UploadedFile[]>([]);
  const [idBack, setIdBack] = useState<UploadedFile[]>([]);
  const [selfie, setSelfie] = useState<UploadedFile[]>([]);
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  
  // ID validation
  const [idValidation, setIdValidation] = useState<RwandaIDValidation | null>(null);
  
  // Camera for selfie
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const loadVerificationStatus = async () => {
    setLoading(true);
    const status = await verificationService.getVerificationStatus();
    setVerification(status);
    
    if (status) {
      if (status.status === 'approved') {
        setCurrentStep('status');
      } else if (status.status === 'pending' || status.status === 'under_review') {
        setCurrentStep('submitted');
      } else if (status.status === 'rejected') {
        setCurrentStep('status');
      }
    } else {
      setCurrentStep('upload-id');
    }
    
    setLoading(false);
  };

  const validateIdNumber = () => {
    const validation = verificationService.validateRwandaID(idNumber);
    setIdValidation(validation);
    
    if (validation.valid && validation.extracted) {
      setGender(validation.extracted.gender);
      setDateOfBirth(validation.extracted.dateOfBirth);
    }
    
    return validation.valid;
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setCameraActive(true);
      setError('');
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip the image horizontally (mirror effect)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file: UploadedFile = {
              id: `selfie_${Date.now()}`,
              name: 'selfie.jpg',
              size: blob.size,
              type: 'image/jpeg',
              url: URL.createObjectURL(blob),
              uploadedAt: new Date().toISOString(),
            };
            setSelfie([file]);
            stopCamera();
          } else {
            setError('Failed to capture photo. Please try again.');
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleSubmit = async () => {
    if (!idFront[0] || !selfie[0]) {
      setError('Please upload all required documents');
      return;
    }

    if (!validateIdNumber()) {
      setError('Please enter a valid Rwanda National ID');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Upload documents
      const idFrontFile = await fetch(idFront[0].url).then(r => r.blob());
      const selfieFile = await fetch(selfie[0].url).then(r => r.blob());
      
      const idFrontUpload = await verificationService.uploadDocument(
        user!.id,
        new File([idFrontFile], 'id_front.jpg', { type: 'image/jpeg' }),
        'id_front'
      );

      if (idFrontUpload.error) {
        throw new Error(idFrontUpload.error);
      }

      const selfieUpload = await verificationService.uploadDocument(
        user!.id,
        new File([selfieFile], 'selfie.jpg', { type: 'image/jpeg' }),
        'selfie'
      );

      if (selfieUpload.error) {
        throw new Error(selfieUpload.error);
      }

      let idBackUrl = undefined;
      if (idBack[0]) {
        const idBackFile = await fetch(idBack[0].url).then(r => r.blob());
        const idBackUpload = await verificationService.uploadDocument(
          user!.id,
          new File([idBackFile], 'id_back.jpg', { type: 'image/jpeg' }),
          'id_back'
        );
        if (!idBackUpload.error) {
          idBackUrl = idBackUpload.url;
        }
      }

      // Submit verification
      const result = await verificationService.submitVerification({
        document_number: idNumber,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        gender: gender,
        place_of_birth: placeOfBirth || undefined,
        document_front_url: idFrontUpload.url,
        selfie_url: selfieUpload.url,
        document_back_url: idBackUrl,
      });

      if (result.success) {
        setCurrentStep('submitted');
      } else {
        throw new Error(result.error || 'Failed to submit verification');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </>
    );
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: 'upload-id', label: 'Upload ID' },
      { id: 'selfie', label: 'Selfie' },
      { id: 'details', label: 'Details' },
      { id: 'review', label: 'Review' },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${index <= currentIndex 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
              }
            `}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${index <= currentIndex ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${index < currentIndex ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">ID Verification</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Verify your identity to unlock more opportunities
          </p>
        </div>

        {currentStep === 'status' && verification && (
          <Card className="p-6">
            {verification.status === 'approved' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Verified!</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your identity has been verified. You now have access to all platform features.
                </p>
                <div className="mt-6 flex gap-2 justify-center">
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ID Verified
                  </span>
                  {verification.face_match_passed && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Face Verified
                    </span>
                  )}
                </div>
              </div>
            )}

            {verification.status === 'rejected' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Verification Rejected</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {verification.rejection_reason || 'Your verification was rejected. Please try again.'}
                </p>
                <Button onClick={() => setCurrentStep('upload-id')}>
                  Try Again
                </Button>
              </div>
            )}
          </Card>
        )}

        {currentStep === 'submitted' && (
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Under Review</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your verification is being reviewed by our team. This usually takes 24-48 hours.
            </p>
            <p className="text-sm text-neutral-500 mt-4">
              We'll notify you once the review is complete.
            </p>
          </Card>
        )}

        {['upload-id', 'selfie', 'details', 'review'].includes(currentStep) && (
          <>
            {renderStepIndicator()}

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {currentStep === 'upload-id' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Upload National ID</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Please upload a clear photo of your Rwanda National ID (Indangamuntu)
                </p>

                <div className="space-y-6">
                  <FileUpload
                    label="ID Front (Required)"
                    accept="image/*"
                    maxSize={5}
                    onUpload={setIdFront}
                    onError={setError}
                    existingFiles={idFront}
                    onRemove={() => setIdFront([])}
                    hint="Clear photo of the front of your ID"
                  />

                  <FileUpload
                    label="ID Back (Optional)"
                    accept="image/*"
                    maxSize={5}
                    onUpload={setIdBack}
                    onError={setError}
                    existingFiles={idBack}
                    onRemove={() => setIdBack([])}
                    hint="Clear photo of the back of your ID"
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="primary"
                      onClick={() => setCurrentStep('selfie')}
                      disabled={idFront.length === 0}
                    >
                      Next: Take Selfie
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'selfie' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Take a Selfie</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Take a clear photo of your face for verification
                </p>

                <div className="space-y-6">
                  {/* Initial state - show both options */}
                  {!cameraActive && selfie.length === 0 && (
                    <div className="space-y-6">
                      {/* Camera option */}
                      <div className="text-center p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors">
                        <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Use Camera</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                          Take a live photo with your camera
                        </p>
                        <Button onClick={startCamera}>
                          Start Camera
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500">or</span>
                        </div>
                      </div>

                      {/* Upload option */}
                      <div>
                        <FileUpload
                          label="Upload Selfie Photo"
                          accept="image/*"
                          maxSize={5}
                          onUpload={setSelfie}
                          onError={setError}
                          existingFiles={selfie}
                          onRemove={() => setSelfie([])}
                          hint="Upload a clear photo of your face (JPG, PNG, max 5MB)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Camera active - show video feed */}
                  {cameraActive && (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        {/* Camera frame overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-64 border-4 border-white rounded-full opacity-50"></div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-3">
                        <Button variant="secondary" onClick={stopCamera}>
                          Cancel
                        </Button>
                        <Button onClick={captureSelfie} size="lg">
                          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          Capture Photo
                        </Button>
                      </div>
                      <p className="text-center text-sm text-neutral-500">
                        Position your face in the circle and click Capture Photo
                      </p>
                    </div>
                  )}

                  {/* Photo captured - show preview */}
                  {selfie.length > 0 && !cameraActive && (
                    <div className="space-y-4">
                      <div className="relative">
                        <img 
                          src={selfie[0].url} 
                          alt="Selfie preview" 
                          className="w-full max-w-md mx-auto rounded-lg border-2 border-neutral-200 dark:border-neutral-700" 
                        />
                      </div>
                      <div className="flex justify-center gap-3 flex-wrap">
                        <Button variant="secondary" onClick={() => { setSelfie([]); }}>
                          Remove
                        </Button>
                        <Button variant="secondary" onClick={() => { setSelfie([]); startCamera(); }}>
                          Retake with Camera
                        </Button>
                        <Button onClick={() => setCurrentStep('details')}>
                          Next: Enter Details →
                        </Button>
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="secondary" onClick={() => setCurrentStep('upload-id')}>
                    ← Back
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 'details' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Enter ID Details</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Please enter the information from your National ID
                </p>

                <div className="space-y-4">
                  <div>
                    <Input
                      label="National ID Number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      onBlur={validateIdNumber}
                      placeholder="1 1990 05 15 12345 6"
                      hint="16 digits from your National ID"
                    />
                    {idValidation && !idValidation.valid && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {idValidation.errors.map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                      </div>
                    )}
                    {idValidation && idValidation.valid && (
                      <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Valid ID number
                      </div>
                    )}
                  </div>

                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="As shown on your ID"
                  />

                  <Input
                    label="Date of Birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={idValidation?.valid}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Gender
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Male"
                          checked={gender === 'Male'}
                          onChange={(e) => setGender(e.target.value)}
                          disabled={idValidation?.valid}
                          className="mr-2"
                        />
                        Male
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Female"
                          checked={gender === 'Female'}
                          onChange={(e) => setGender(e.target.value)}
                          disabled={idValidation?.valid}
                          className="mr-2"
                        />
                        Female
                      </label>
                    </div>
                  </div>

                  <Input
                    label="Place of Birth (Optional)"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="City/District"
                  />

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" onClick={() => setCurrentStep('selfie')}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep('review')}
                      disabled={!idNumber || !fullName || !dateOfBirth || !gender}
                    >
                      Next: Review
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'review' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Review & Submit</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Please review your information before submitting
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Documents</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">ID Front</p>
                        <img src={idFront[0]?.url} alt="ID Front" className="w-full rounded border" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Selfie</p>
                        <img src={selfie[0]?.url} alt="Selfie" className="w-full rounded border" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">ID Number:</span>
                        <span className="font-medium">{idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Full Name:</span>
                        <span className="font-medium">{fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Date of Birth:</span>
                        <span className="font-medium">{dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Gender:</span>
                        <span className="font-medium">{gender}</span>
                      </div>
                      {placeOfBirth && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Place of Birth:</span>
                          <span className="font-medium">{placeOfBirth}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      By submitting, you confirm that all information provided is accurate and matches your official ID document.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" onClick={() => setCurrentStep('details')}>
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
