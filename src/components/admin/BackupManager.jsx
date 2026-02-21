import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Database, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupManager() {
  const [userEmail, setUserEmail] = useState('');
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const queryClient = useQueryClient();

  // Fetch backups
  const { data: backups, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: () => base44.entities.UserBackup.list('-backup_timestamp', 50)
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (email) => {
      const response = await base44.functions.invoke('automatedBackup', {
        user_email: email,
        backup_type: 'full'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Backup created successfully');
      setUserEmail('');
    },
    onError: (error) => {
      toast.error(`Backup failed: ${error.message}`);
    }
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId) => {
      const response = await base44.functions.invoke('restoreBackup', {
        backup_id: backupId
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Backup restored successfully');
      setSelectedBackupId('');
    },
    onError: (error) => {
      toast.error(`Restore failed: ${error.message}`);
    }
  });

  const handleCreateBackup = () => {
    if (!userEmail.trim()) {
      toast.error('Please enter a user email');
      return;
    }
    createBackupMutation.mutate(userEmail);
  };

  const handleRestore = () => {
    if (!selectedBackupId) {
      toast.error('Please select a backup to restore');
      return;
    }
    if (confirm('Are you sure you want to restore this backup? This will overwrite existing data.')) {
      restoreBackupMutation.mutate(selectedBackupId);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#8b85f7]" />
            Backup Management
          </CardTitle>
          <CardDescription>
            Create and restore user data backups for safety and recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Backup */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="userEmail">User Email</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCreateBackup}
                  disabled={createBackupMutation.isPending}
                  className="bg-[#8b85f7] hover:bg-[#9a95ff]"
                >
                  {createBackupMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Create Backup
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Restore Backup */}
          <div className="border-t border-[#2d1e50] pt-6">
            <div className="space-y-4">
              <Label htmlFor="backupId">Select Backup to Restore</Label>
              <div className="flex gap-2">
                <select
                  id="backupId"
                  value={selectedBackupId}
                  onChange={(e) => setSelectedBackupId(e.target.value)}
                  className="flex-1 bg-[#1a0f2e] border border-[#2d1e50] rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- Select a backup --</option>
                  {backups?.map((backup) => (
                    <option key={backup.id} value={backup.id}>
                      {backup.user_email} - {new Date(backup.backup_timestamp).toLocaleString()} ({formatBytes(backup.backup_size)})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleRestore}
                  disabled={restoreBackupMutation.isPending || !selectedBackupId}
                  variant="outline"
                  className="border-[#ff8e42] text-[#ff8e42] hover:bg-[#ff8e42] hover:text-white"
                >
                  {restoreBackupMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Restore
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Recent Backups</CardTitle>
          <CardDescription>View and manage all system backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#64748b]">Loading backups...</div>
          ) : backups?.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-[#64748b]" />
              <p className="text-[#64748b]">No backups found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups?.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 bg-[#1a0f2e] border border-[#2d1e50] rounded-lg hover:border-[#8b85f7] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{backup.user_email}</span>
                        <Badge className="badge-primary">{backup.backup_type}</Badge>
                        {backup.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-[#64748b]">
                        {new Date(backup.backup_timestamp).toLocaleString()} • {formatBytes(backup.backup_size)}
                      </div>
                      {backup.entities_backed_up && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {backup.entities_backed_up.map((entity) => (
                            <Badge key={entity} variant="outline" className="text-xs">
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}