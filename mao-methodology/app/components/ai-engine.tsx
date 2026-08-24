'use client';

import { useState } from 'react';

interface AIEngineProps {
  showEngine?: boolean;
}

export default function AIEngine({ showEngine }: AIEngineProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunEngine = async () => {
    if (!prompt.trim()) {
      setError('Please enter your fitness question');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/ai/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    'What should my macros be for muscle building?',
    'How do I optimize my recovery between sessions?',
    'What\'s the best approach for cutting while maintaining muscle?',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold operator-accent mb-2">MAO AI Engine</h3>
          <p className="text-gray-400">Get personalized macro optimization recommendations powered by advanced AI.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Fitness Question
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder="Ask anything about macros, training, nutrition, recovery..."
              rows={5}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRunEngine}
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                'Run AI Powered Engine'
              )}
            </button>
            <button
              onClick={() => setPrompt('')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-4">
              <p className="text-amber-400 text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="bg-cyan-400/10 border border-cyan-400/30 rounded p-6 space-y-4">
              <h4 className="text-cyan-400 font-medium">AI Recommendation:</h4>
              <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {response}
              </div>
            </div>
          )}

          <div className="border-t operator-border pt-6 mt-6">
            <p className="text-sm text-gray-400 mb-4">Quick Examples:</p>
            <div className="space-y-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="block w-full text-left px-4 py-3 rounded border operator-border hover:bg-cyan-400/5 hover:border-cyan-400/50 transition-colors text-sm text-gray-300 hover:text-cyan-400"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
