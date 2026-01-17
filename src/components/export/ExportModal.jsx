import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

const EXPORT_CONFIGS = {
  portfolio: { label: 'Portfolio Data', format: 'CSV', description: 'All portfolio ideas and details' },
  transactions: { label: 'Transactions', format: 'CSV', description: 'Financial transactions and history' },
  performance: { label: 'Performance Report', format: 'PDF', description: 'Comprehensive performance analysis' },
  all: { label: 'Complete Data', format: 'ZIP', description: 'All data in a compressed file' }
};

export default function ExportModal({ isOpen, onClose, exportType }) {
  const [exportStatus, setExportStatus] = useState(null);

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('exportUserData', { 
        exportType,
        format: EXPORT_CONFIGS[exportType]?.format 
      });
      return response.data;
    },
    onSuccess: (data) => {
      setExportStatus('success');
      // Trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => onClose(), 2000);
    },
    onError: (error) => {
      setExportStatus('error');
    }
  });

  const handleExport = () => {
    setExportStatus('loading');
    exportMutation.mutate();
  };

  if (!isOpen) return null;

  const config = EXPORT_CONFIGS[exportType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle className="text-white">Export {config?.label}</DialogTitle>
          <DialogDescription className="text-[#64748b]">
            {config?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {exportStatus === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <LoadingSpinner text="Preparing your export..." />
            </div>
          )}

          {exportStatus === 'success' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="w-12 h-12 text-[#10b981]" />
              <p className="text-white font-medium">Export Complete!</p>
              <p className="text-sm text-[#64748b]">Your file is downloading...</p>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center bg-[#ef4444]/10 border border-[#ef4444]/50 rounded-lg p-4">
              <AlertCircle className="w-12 h-12 text-[#ef4444]" />
              <p className="text-white font-medium">Export Failed</p>
              <p className="text-sm text-[#64748b]">Please try again</p>
            </div>
          )}

          {!exportStatus && (
            <div className="space-y-3 bg-[#2d1e50]/50 rounded-lg p-4 border border-[#2d1e50]">
              <p className="text-sm text-[#64748b]">
                <strong>Format:</strong> {config?.format}
              </p>
              <p className="text-sm text-[#64748b]">
                <strong>Privacy:</strong> This file contains only your personal data and is encrypted.
              </p>
              <p className="text-sm text-[#64748b]">
                <strong>Retention:</strong> We delete the generated file after 24 hours for security.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2d1e50] text-[#64748b]"
            disabled={exportStatus === 'loading'}
          >
            Cancel
          </Button>
          {!exportStatus && (
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
            >
              Export {config?.format}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}