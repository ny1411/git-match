import React, { type ChangeEvent } from 'react';
import type { OnboardingFormData } from '../../../types/onboarding';
import { RELATIONSHIP_GOALS } from '../../../utils/onboarding.utils';

interface RelationshipGoalsStepProps {
  formData: OnboardingFormData;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const RelationshipGoalsStep: React.FC<RelationshipGoalsStepProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <div className="space-y-8">
      <h3 className="mb-6 text-xl font-semibold text-purple-300">3. Relationship Goals</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {RELATIONSHIP_GOALS.map((goal) => (
          <div key={goal} className="relative">
            <input
              type="radio"
              id={goal}
              name="relationshipGoals"
              value={goal}
              checked={formData.relationshipGoals === goal}
              onChange={onInputChange}
              className="hidden"
            />
            <label
              htmlFor={goal}
              className={`block cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                formData.relationshipGoals === goal
                  ? 'border-purple-500 bg-purple-600 text-white shadow-xl shadow-purple-900/50'
                  : 'border-gray-700 bg-white/5 text-gray-300 hover:border-purple-500/50'
              }`}
            >
              <span className="text-lg font-semibold">{goal}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelationshipGoalsStep;
