import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, AlertCircle } from 'lucide-react';

export default function BackupStatus({ backups = [] }) {
  if (backups.length === 0) {
    return (
      <div className="text-center py-6 border border-[#2d1e50] rounded-lg bg-[#2d1e50]/20">
        <Clock className="w-8 h-8 text-[#64748b] mx-auto mb-2" />
        <p className="text-[#64748b] text-sm">No backups yet. First backup will be created automatically.</p>
      </div>
    );
  }

  const latestBackup = backups[0];
  const isRecent = new Date() - new Date(latestBackup.created_at) < 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 bg-[#2d1e50]/30 rounded-lg border border-[#2d1e50]">
        {isRecent ? (
          <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-[#ff8e42] flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Latest Backup</p>
          <p className="text-xs text-[#64748b] mt-1">
            {formatDistanceToNow(new Date(latestBackup.created_at), { addSuffix: true })}
          </p>
          <p className="text-xs text-[#64748b] mt-0.5">
            Size: {(latestBackup.size_mb || 0).toFixed(2)} MB
          </p>
        </div>
      </div>

      <details className="text-xs">
        <summary className="text-[#64748b] cursor-pointer hover:text-[#8b85f7] transition-colors">
          View recent backups ({backups.length})
        </summary>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {backups.map((backup, idx) => (
            <div key={backup.id} className="px-3 py-2 bg-[#2d1e50]/20 rounded text-[#64748b]">
              #{idx + 1} • {formatDistanceToNow(new Date(backup.created_at), { addSuffix: true })}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}