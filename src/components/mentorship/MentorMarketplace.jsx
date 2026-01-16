import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  User, Star, CheckCircle, Clock, DollarSign, Search,
  Calendar, MessageSquare, Award, TrendingUp 
} from 'lucide-react';

/**
 * Mentor Marketplace Component
 * Browse and connect with verified passive income experts
 */
export default function MentorMarketplace({ portfolioIdeaId = null, onSelect = null }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => base44.entities.Mentor.list()
  });

  const bookSession = useMutation({
    mutationFn: async (sessionData) => {
      return await base44.entities.MentorshipSession.create(sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session booked! Check your email for confirmation.');
      setBookingModalOpen(false);
    }
  });

  const specializations = ['all', ...new Set(mentors.flatMap(m => m.specializations || []))];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpecialization === 'all' || 
                       mentor.specializations?.includes(selectedSpecialization);
    return matchesSearch && matchesSpec && mentor.verified;
  });

  const handleBook = (mentor) => {
    setSelectedMentor(mentor);
    setBookingModalOpen(true);
  };

  const confirmBooking = () => {
    bookSession.mutate({
      mentor_id: selectedMentor.id,
      portfolio_idea_id: portfolioIdeaId,
      session_type: '1-on-1',
      session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      duration_minutes: 60,
      status: 'scheduled',
      cost: selectedMentor.hourly_rate
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentors..."
            className="pl-10"
          />
        </div>

        <select
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          {specializations.map(spec => (
            <option key={spec} value={spec}>
              {spec === 'all' ? 'All Specializations' : spec}
            </option>
          ))}
        </select>
      </div>

      {/* Mentor Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map(mentor => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                  {mentor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                    {mentor.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{mentor.rating || 5.0}</span>
                    <span className="text-gray-500">({mentor.review_count || 0})</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {mentor.bio}
              </p>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1 mb-4">
                {mentor.specializations?.slice(0, 3).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-600" />
                  <div>
                    <p className="text-gray-600">Experience</p>
                    <p className="font-semibold">{mentor.experience_years}+ years</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-gray-600">Students</p>
                    <p className="font-semibold">{mentor.success_metrics?.students_mentored || 0}</p>
                  </div>
                </div>
              </div>

              {/* Rate & Availability */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="font-bold text-gray-900">${mentor.hourly_rate}/hr</span>
                </div>
                <Badge className={
                  mentor.availability === 'available' ? 'bg-green-100 text-green-700' :
                  mentor.availability === 'limited' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }>
                  {mentor.availability}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleBook(mentor)}
                  disabled={mentor.availability === 'unavailable'}
                  className="flex-1"
                  size="sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No mentors found matching your criteria</p>
        </div>
      )}

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session with {selectedMentor?.name}</DialogTitle>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                    {selectedMentor.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{selectedMentor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedMentor.specializations?.[0]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">60 minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost</p>
                    <p className="font-semibold">${selectedMentor.hourly_rate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  📅 Your session will be scheduled within 7 days. You'll receive a calendar invite 
                  and meeting link via email.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={confirmBooking} disabled={bookSession.isPending} className="flex-1">
                  {bookSession.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
                <Button variant="outline" onClick={() => setBookingModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}