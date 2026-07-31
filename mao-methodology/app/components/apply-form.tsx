'use client';

import { useState } from 'react';
import { z } from 'zod';

const FormSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  experience: z.string().min(1, 'Required'),
  goal: z.string().min(10, 'Goal required'),
  diet: z.string().min(1, 'Required'),
  commitment: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof FormSchema>;

interface ApplyFormProps {
  onComplete?: (data: FormData) => void;
  showPricing?: boolean;
}

export default function ApplyForm({ onComplete, showPricing }: ApplyFormProps) {
  const [phase, setPhase] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePhase = () => {
    const phaseFields = {
      1: ['name', 'email', 'phone'] as const,
      2: ['experience', 'goal'] as const,
      3: ['diet', 'commitment'] as const,
    };

    const fieldsToCheck = phaseFields[phase as keyof typeof phaseFields] || [];
    const newErrors: Record<string, string> = {};

    fieldsToCheck.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validatePhase()) {
      if (phase < 3) {
        setPhase(phase + 1);
      } else {
        try {
          const validated = FormSchema.parse(formData);
          onComplete?.(validated);
        } catch (e) {
          if (e instanceof z.ZodError) {
            const errorMap: Record<string, string> = {};
            e.errors.forEach(err => {
              const field = err.path[0] as string;
              errorMap[field] = err.message;
            });
            setErrors(errorMap);
          }
        }
      }
    }
  };

  const handleBack = () => {
    if (phase > 1) setPhase(phase - 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border operator-border rounded-lg p-8">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i <= phase ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-cyan-400 text-sm font-medium">Phase {phase} of 4</p>
        </div>

        <div className="space-y-4">
          {phase === 1 && (
            <>
              <h3 className="text-xl font-bold text-white mb-6">Your Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                  placeholder="Your name"
                />
                {errors.name && <p className="text-amber-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-amber-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full"
                  placeholder="(555) 000-0000"
                />
                {errors.phone && <p className="text-amber-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </>
          )}

          {phase === 2 && (
            <>
              <h3 className="text-xl font-bold text-white mb-6">Your Experience</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Training Experience
                </label>
                <select
                  value={formData.experience || ''}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level...</option>
                  <option value="beginner">Beginner (0-1 year)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
                {errors.experience && <p className="text-amber-500 text-sm mt-1">{errors.experience}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What's your primary goal?
                </label>
                <textarea
                  value={formData.goal || ''}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  className="w-full"
                  placeholder="E.g., Build muscle mass, cut fat, improve strength..."
                  rows={4}
                />
                {errors.goal && <p className="text-amber-500 text-sm mt-1">{errors.goal}</p>}
              </div>
            </>
          )}

          {phase === 3 && (
            <>
              <h3 className="text-xl font-bold text-white mb-6">Diet & Commitment</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Diet Approach
                </label>
                <select
                  value={formData.diet || ''}
                  onChange={(e) => handleInputChange('diet', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select option...</option>
                  <option value="counting">Macro counting</option>
                  <option value="intuitive">Intuitive eating</option>
                  <option value="other">Other/Learning</option>
                </select>
                {errors.diet && <p className="text-amber-500 text-sm mt-1">{errors.diet}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weekly Commitment
                </label>
                <select
                  value={formData.commitment || ''}
                  onChange={(e) => handleInputChange('commitment', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level...</option>
                  <option value="flexible">Flexible (2-3 hours/week)</option>
                  <option value="dedicated">Dedicated (5-7 hours/week)</option>
                  <option value="intensive">Intensive (10+ hours/week)</option>
                </select>
                {errors.commitment && <p className="text-amber-500 text-sm mt-1">{errors.commitment}</p>}
              </div>
            </>
          )}

          {phase === 4 && (
            <>
              <h3 className="text-xl font-bold text-white mb-6">Review & Pricing</h3>
              <div className="bg-slate-800/50 rounded p-4 border operator-border mb-6">
                <p className="text-gray-300 text-sm mb-4">
                  Your application is complete. Pricing and package options are now visible.
                </p>
                {showPricing && (
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/30 rounded">
                    <p className="text-cyan-400 font-medium text-sm">
                      Premium packages available based on your profile. Coach Jay will reach out within 24 hours to discuss.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className={`btn btn-secondary ${phase === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={phase === 1}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="btn btn-primary flex-1"
          >
            {phase === 4 ? 'Complete Application' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
