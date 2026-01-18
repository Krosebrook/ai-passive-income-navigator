import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(50);

  const monthlyHoursSaved = hoursPerWeek * 4;
  const monthlySavings = monthlyHoursSaved * hourlyRate;
  const yearlySavings = monthlySavings * 12;

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-violet-900/20 p-8 md:p-12 border border-white/10"
    >
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Calculate Your Time Savings
        </h3>
        <p className="text-gray-400 mb-8">
          See how much time and money FlashFusion saves you
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-300">
                Hours spent researching per week:
              </label>
              <div className="text-2xl font-bold text-white">
                {hoursPerWeek} <span className="text-sm text-gray-400">hrs</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 hr</span>
              <span>40 hrs</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-300">
                Your hourly rate:
              </label>
              <div className="text-2xl font-bold text-white">
                ${hourlyRate}<span className="text-sm text-gray-400">/hr</span>
              </div>
            </div>
            <input
              type="range"
              min="25"
              max="500"
              step="25"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$25</span>
              <span>$500</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/20"
          >
            <p className="text-sm text-gray-400 mb-2">Monthly Time Saved</p>
            <p className="text-3xl font-bold text-green-400">
              {monthlyHoursSaved} <span className="text-lg">hrs</span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/20"
          >
            <p className="text-sm text-gray-400 mb-2">Monthly Value</p>
            <p className="text-3xl font-bold text-blue-400">
              ${monthlySavings.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl p-6 border border-purple-500/20"
          >
            <p className="text-sm text-gray-400 mb-2">Yearly Value</p>
            <p className="text-3xl font-bold text-purple-400">
              ${yearlySavings.toLocaleString()}
            </p>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-8 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Start Saving Time Now →
        </motion.button>
      </div>
    </motion.section>
  );
}