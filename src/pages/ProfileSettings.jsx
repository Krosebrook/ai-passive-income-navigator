import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, Settings, Target, Clock, DollarSign,
  Save, Loader2, CheckCircle, LogOut
} from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SKILLS = [
  'Writing & Content', 'Design & Graphics', 'Marketing', 'Programming',
  'Video & Audio', 'Sales', 'Data Analysis', 'Teaching',
  'Social Media', 'Photography', 'Finance', 'Project Management'
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Health & Wellness', 'Education', 
  'Entertainment', 'E-commerce', 'Real Estate', 'Travel',
  'Food & Beverage', 'Fashion', 'Sports', 'Art & Design'
];

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.list();
      return prefs[0] || null;
    }
  });

  const [formData, setFormData] = useState({
    risk_tolerance: 2,
    time_commitment: 2,
    target_monthly_income: 1000,
    tech_comfort_level: 2,
    passive_income_goal: 'side_income',
    income_timeline: '6_months',
    business_complexity_preference: 'moderate',
    existing_skills: [],
    industries_to_focus: [],
    industries_to_avoid: []
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        risk_tolerance: preferences.risk_tolerance ?? 2,
        time_commitment: preferences.time_commitment ?? 2,
        target_monthly_income: preferences.target_monthly_income ?? 1000,
        tech_comfort_level: preferences.tech_comfort_level ?? 2,
        passive_income_goal: preferences.passive_income_goal || 'side_income',
        income_timeline: preferences.income_timeline || '6_months',
        business_complexity_preference: preferences.business_complexity_preference || 'moderate',
        existing_skills: preferences.existing_skills || [],
        industries_to_focus: preferences.industries_to_focus || [],
        industries_to_avoid: preferences.industries_to_avoid || []
      });
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (preferences?.id) {
        await base44.entities.UserPreferences.update(preferences.id, {
          ...formData,
          has_completed_onboarding: true
        });
      } else {
        await base44.entities.UserPreferences.create({
          ...formData,
          has_completed_onboarding: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      setSaved(true);
      toast.success('Preferences saved successfully');
      setTimeout(() => setSaved(false), 2000);
    }
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      existing_skills: prev.existing_skills.includes(skill)
        ? prev.existing_skills.filter(s => s !== skill)
        : [...prev.existing_skills, skill]
    }));
  };

  const toggleIndustryFocus = (industry) => {
    setFormData(prev => ({
      ...prev,
      industries_to_focus: prev.industries_to_focus.includes(industry)
        ? prev.industries_to_focus.filter(i => i !== industry)
        : [...prev.industries_to_focus, industry]
    }));
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (isLoading) return <LoadingSpinner text="Loading settings..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Profile & Settings"
          subtitle="Customize your preferences"
          gradient="from-gray-700 to-gray-900"
        />

        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user?.full_name || 'User'}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Income Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Primary Goal</Label>
                    <Select 
                      value={formData.passive_income_goal}
                      onValueChange={(value) => setFormData({ ...formData, passive_income_goal: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="side_income">Side Income ($500-$1K)</SelectItem>
                        <SelectItem value="supplement">Supplement Job ($1K-$3K)</SelectItem>
                        <SelectItem value="replace_job">Replace My Job ($3K-$10K)</SelectItem>
                        <SelectItem value="financial_freedom">Financial Freedom ($10K+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <Select 
                      value={formData.income_timeline}
                      onValueChange={(value) => setFormData({ ...formData, income_timeline: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_month">1 Month</SelectItem>
                        <SelectItem value="3_months">3 Months</SelectItem>
                        <SelectItem value="6_months">6 Months</SelectItem>
                        <SelectItem value="1_year">1 Year</SelectItem>
                        <SelectItem value="2_years">2+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Target Monthly Income</Label>
                    <span className="font-semibold text-emerald-600">
                      ${formData.target_monthly_income?.toLocaleString()}/mo
                    </span>
                  </div>
                  <Slider
                    value={[formData.target_monthly_income]}
                    onValueChange={([value]) => setFormData({ ...formData, target_monthly_income: value })}
                    max={20000}
                    step={500}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Risk Tolerance</Label>
                    <span className="text-sm text-gray-500">
                      {['Very Low', 'Low', 'Moderate', 'High', 'Very High'][formData.risk_tolerance]}
                    </span>
                  </div>
                  <Slider
                    value={[formData.risk_tolerance]}
                    onValueChange={([value]) => setFormData({ ...formData, risk_tolerance: value })}
                    max={4}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Time Commitment (hours/week)</Label>
                    <span className="text-sm text-gray-500">
                      {['1-5', '5-10', '10-20', '20-40', '40+'][formData.time_commitment]} hours
                    </span>
                  </div>
                  <Slider
                    value={[formData.time_commitment]}
                    onValueChange={([value]) => setFormData({ ...formData, time_commitment: value })}
                    max={4}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Tech Comfort Level</Label>
                    <span className="text-sm text-gray-500">
                      {['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][formData.tech_comfort_level]}
                    </span>
                  </div>
                  <Slider
                    value={[formData.tech_comfort_level]}
                    onValueChange={([value]) => setFormData({ ...formData, tech_comfort_level: value })}
                    max={4}
                    step={1}
                  />
                </div>

                <div>
                  <Label>Business Complexity</Label>
                  <Select 
                    value={formData.business_complexity_preference}
                    onValueChange={(value) => setFormData({ ...formData, business_complexity_preference: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple - Easy to start, low maintenance</SelectItem>
                      <SelectItem value="moderate">Moderate - Some learning required</SelectItem>
                      <SelectItem value="complex">Complex - Higher potential, more effort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {SKILLS.map((skill) => {
                    const isSelected = formData.existing_skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected 
                            ? 'border-violet-500 bg-violet-50 text-violet-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Industries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Industries of Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {INDUSTRIES.map((industry) => {
                    const isSelected = formData.industries_to_focus.includes(industry);
                    return (
                      <button
                        key={industry}
                        onClick={() => toggleIndustryFocus(industry)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {industry}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2 h-12"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saved ? 'Saved!' : 'Save Preferences'}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 h-12"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}