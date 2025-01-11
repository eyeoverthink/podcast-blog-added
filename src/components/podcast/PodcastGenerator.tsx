'use client';

import { Mic } from 'lucide-react';

const PodcastGenerator = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">AI Podcast Generator</h1>
        <p className="text-gray-400">Transform your ideas into engaging podcast episodes</p>
      </div>

      <div className="bg-[#1a1b1e] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Mic className="w-6 h-6 text-purple-500" />
            <span className="text-white">0 Credits</span>
            <span className="text-gray-400">(Cost: 1 credit)</span>
          </div>
          <button className="button-primary">
            Buy Credits
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Title</label>
            <input
              type="text"
              placeholder="Enter your podcast title"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              placeholder="Enter a brief description of your podcast"
              className="input-field min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Voice Type</label>
            <select className="input-field">
              <option value="">Select a voice type</option>
              <option value="male">Male Voice</option>
              <option value="female">Female Voice</option>
              <option value="neutral">Neutral Voice</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Prompt</label>
            <textarea
              placeholder="Enter the text you want to convert to speech"
              className="input-field min-h-[150px]"
            />
          </div>

          <button className="w-full button-primary">
            Generate Podcast
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodcastGenerator;
