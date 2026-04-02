import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingNavigation from '../components/onboarding/OnboardingNavigation';
import OnboardingProgress from '../components/onboarding/OnboardingProgress';
import OnboardingStatus from '../components/onboarding/OnboardingStatus';
import PersonalInfoStep from '../components/onboarding/steps/PersonalInfoStep';
import PreferencesStep from '../components/onboarding/steps/PreferencesStep';
import RelationshipGoalsStep from '../components/onboarding/steps/RelationshipGoalsStep';
import BgGradient from '../components/ui/BgGradient';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import { TOTAL_ONBOARDING_STEPS, getMaxAdultDobDate } from '../utils/onboarding.utils';

const Onboarding: FC = () => {
  const navigate = useNavigate();
  const { userProfile, firebaseToken, markProfileComplete } = useAuth();

  const {
    currentStep,
    formData,
    status,
    useGeo,
    handleInputChange,
    handleGeoChange,
    handleInterestChange,
    setManualLocationEntry,
    captureCurrentLocation,
    goToPreviousStep,
    goToNextStep,
    submitProfile,
  } = useOnboarding({
    firebaseToken,
    userId: userProfile?.uid,
  });

  const maxDobDate = useMemo(() => getMaxAdultDobDate(), []);

  const handleSubmit = async () => {
    const isSuccess = await submitProfile();
    if (isSuccess) {
      markProfileComplete();
      navigate('/dashboard', { replace: true });
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <PersonalInfoStep
          formData={formData}
          useGeo={useGeo}
          loading={status.loading}
          maxDobDate={maxDobDate}
          onInputChange={handleInputChange}
          onGeoChange={handleGeoChange}
          onUseCurrentLocation={captureCurrentLocation}
          onManualLocation={setManualLocationEntry}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <PreferencesStep
          formData={formData}
          onInputChange={handleInputChange}
          onInterestToggle={handleInterestChange}
        />
      );
    }

    return <RelationshipGoalsStep formData={formData} onInputChange={handleInputChange} />;
  };

  return (
    <div className="relative min-h-screen w-full">
      <BgGradient />

      <main className="relative z-10 flex items-center justify-center p-4 py-6">
        <div className="w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
          <h1 className="mb-4 text-center text-3xl font-bold text-white">Profile Setup</h1>

          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_ONBOARDING_STEPS} />
          <OnboardingStatus status={status} />

          {renderStepContent()}

          <OnboardingNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            loading={status.loading}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
            onSubmit={() => {
              void handleSubmit();
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
