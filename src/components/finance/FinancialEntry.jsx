import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export default function FinancialEntry({ idea: _idea, onSave, isLoading }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    revenue: '',
    expenses: '',
    software_tools: '',
    advertising: '',
    contractors: '',
    hosting: '',
    other: '',
    notes: ''
  });

  const handleSubmit = () => {
    onSave({
      ...formData,
      revenue: parseFloat(formData.revenue) || 0,
      expenses: parseFloat(formData.expenses) || 0,
      expense_breakdown: {
        software_tools: parseFloat(formData.software_tools) || 0,
        advertising: parseFloat(formData.advertising) || 0,
        contractors: parseFloat(formData.contractors) || 0,
        hosting: parseFloat(formData.hosting) || 0,
        other: parseFloat(formData.other) || 0
      }
    });
    setFormData({
      revenue: '',
      expenses: '',
      software_tools: '',
      advertising: '',
      contractors: '',
      hosting: '',
      other: '',
      notes: ''
    });
    setShowForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="gap-2 w-full"
        >
          <Plus className="w-4 h-4" />
          Log Financial Data
        </Button>
      ) : (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Log Today's Performance</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Revenue</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Total Expenses</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-600">Expense Breakdown (optional)</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Input
                  type="number"
                  placeholder="Software"
                  value={formData.software_tools}
                  onChange={(e) => setFormData({ ...formData, software_tools: e.target.value })}
                  className="h-7"
                />
                <Input
                  type="number"
                  placeholder="Advertising"
                  value={formData.advertising}
                  onChange={(e) => setFormData({ ...formData, advertising: e.target.value })}
                  className="h-7"
                />
                <Input
                  type="number"
                  placeholder="Contractors"
                  value={formData.contractors}
                  onChange={(e) => setFormData({ ...formData, contractors: e.target.value })}
                  className="h-7"
                />
                <Input
                  type="number"
                  placeholder="Hosting"
                  value={formData.hosting}
                  onChange={(e) => setFormData({ ...formData, hosting: e.target.value })}
                  className="h-7"
                />
                <Input
                  type="number"
                  placeholder="Other"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                  className="h-7 col-span-2"
                />
              </div>
            </div>

            <Input
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-8"
            />

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-sm"
            >
              Save Performance
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}