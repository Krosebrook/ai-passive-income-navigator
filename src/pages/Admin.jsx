import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Database, Activity } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData?.role !== 'admin') {
          window.location.href = '/';
        }
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage your FlashFusion platform"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card className="card-dark border-neon-purple">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8b85f7]">
                <Users className="w-5 h-5" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#64748b] mt-2">Total registered users</p>
            </CardContent>
          </Card>

          <Card className="card-dark border-neon-cyan">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00b7eb]">
                <Database className="w-5 h-5" />
                Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#64748b] mt-2">Total records</p>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ff8e42]">
                <Activity className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#64748b] mt-2">Active today</p>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ff69b4]">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">Active</p>
              <p className="text-sm text-[#64748b] mt-2">System status</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-gradient">Admin Tools</CardTitle>
              <CardDescription className="text-[#64748b]">
                Platform administration and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#94a3b8]">
                Admin features coming soon. This dashboard will provide full platform management capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}