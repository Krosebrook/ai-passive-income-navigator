import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, X } from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 
  'Real Estate', 'SaaS', 'Education', 'Entertainment'
];

const DATE_PRESETS = [
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 90 Days', value: 'last_90_days' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' }
];

export default function AnalyticsFilters({ filters, onFilterChange }) {
  const toggleIndustry = (industry) => {
    const industries = filters.industries.includes(industry)
      ? filters.industries.filter(i => i !== industry)
      : [...filters.industries, industry];
    onFilterChange({ ...filters, industries });
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: 'last_30_days',
      startDate: null,
      endDate: null,
      industries: [],
      minDealValue: 0
    });
  };

  const activeFilterCount = 
    (filters.industries.length > 0 ? 1 : 0) +
    (filters.minDealValue > 0 ? 1 : 0) +
    (filters.dateRange === 'custom' ? 1 : 0);

  return (
    <Card className="bg-[#1a0f2e] border-[#2d1e50]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#8b85f7]" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-[#8b85f7]/20 text-[#8b85f7]">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Date Range</Label>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => onFilterChange({ ...filters, dateRange: preset.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filters.dateRange === preset.value
                      ? 'bg-[#8b85f7] text-white'
                      : 'bg-[#2d1e50] text-gray-400 hover:bg-[#3d2e60]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label className="text-xs text-gray-400">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Industries */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Industries</Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(industry => (
                <button
                  key={industry}
                  onClick={() => toggleIndustry(industry)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filters.industries.includes(industry)
                      ? 'bg-[#8b85f7] text-white'
                      : 'bg-[#2d1e50] text-gray-400 hover:bg-[#3d2e60]'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* Min Deal Value */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">
              Minimum Deal Value: ${filters.minDealValue.toLocaleString()}
            </Label>
            <Input
              type="number"
              value={filters.minDealValue}
              onChange={(e) => onFilterChange({ ...filters, minDealValue: Number(e.target.value) })}
              placeholder="0"
              step="10000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}