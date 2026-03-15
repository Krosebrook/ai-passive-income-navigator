import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Shield } from 'lucide-react';
import ExportModal from '@/components/export/ExportModal';
import BackupStatus from '@/components/backup/BackupStatus';

export default function DataManagement() {
  const [showExportModal, setShowExportModal] = useState(false);

  const { data: backups, refetch: refetchBackups } = useQuery({
    queryKey: ['backups'],
    queryFn: () => base44.entities.UserBackup?.list?.() || [],
    initialData: []
  });

  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('createUserBackup');
      return result.data;
    },
    onSuccess: () => {
      refetchBackups();
    }
  });

  return (
    <div className="min-h-screen p-6 bg-[#0f0618]">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Data Management"
          subtitle="Export, backup, and manage your data"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Export Section */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[#8b85f7]" />
                <div>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>Download your data in common formats</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
                onClick={() => setShowExportModal(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Open Export Center
              </Button>
              <p className="text-xs text-[#64748b] mt-3 text-center">
                Export deals, opportunities & investments as CSV or PDF
              </p>
            </CardContent>
          </Card>

          {/* Backup Section */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#00b7eb]" />
                <div>
                  <CardTitle>Backup Status</CardTitle>
                  <CardDescription>Automatic cloud backups of your data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <BackupStatus backups={backups} />
              <Button
                onClick={() => triggerBackupMutation.mutate()}
                disabled={triggerBackupMutation.isPending}
                className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
              >
                {triggerBackupMutation.isPending ? 'Creating backup...' : 'Create Backup Now'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="mt-6 bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-lg">Data Management Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#64748b]">
            <div>
              <h4 className="font-semibold text-white mb-2">🔄 Automatic Backups</h4>
              <p>Your data is automatically backed up daily at 2:00 AM UTC. We retain the last 30 backups.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">📥 Export Privacy</h4>
              <p>All exports are generated on-demand and contain only your personal data. They are encrypted in transit and deleted after download.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">🔐 Data Security</h4>
              <p>All backups and exports are encrypted with AES-256. Your data is stored securely and never shared with third parties.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">♻️ Data Retention</h4>
              <p>You can request data deletion at any time. Backups are automatically purged 90 days after account deletion.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}