import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ValidationResultProps {
  isValid: boolean;
  reason: string;
  onReset: () => void;
  onContinue: () => void;
}

export function ValidationResult({ isValid, reason, onReset, onContinue }: ValidationResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isValid ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isValid ? "Face Detected!" : "Oops, try again"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{reason}</p>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Another
          </button>
          {isValid && (
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
