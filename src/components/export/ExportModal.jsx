import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table, CheckCircle, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toCSV(rows) {
  if (!rows || rows.length === 0) return 'No data available';
  const headers = Object.keys(rows[0]).filter(k => !['id', 'created_by'].includes(k));
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generatePDF(title, sections) {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(139, 133, 247);
  doc.text('FlashFusion', 20, y); y += 8;

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(title, 20, y); y += 6;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${date}`, 20, y); y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y); y += 8;

  sections.forEach(({ heading, rows }) => {
    if (y > 260) { doc.addPage(); y = 20; }

    doc.setFontSize(12);
    doc.setTextColor(88, 60, 240);
    doc.text(heading, 20, y); y += 7;

    if (!rows || rows.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('No data available', 24, y); y += 8;
      return;
    }

    const keys = Object.keys(rows[0]).filter(k => !['id', 'created_by'].includes(k)).slice(0, 5);
    const colW = 160 / keys.length;

    // header row
    doc.setFontSize(8);
    doc.setFillColor(240, 238, 255);
    doc.rect(20, y - 4, 170, 7, 'F');
    doc.setTextColor(88, 60, 240);
    keys.forEach((k, i) => doc.text(String(k).replace(/_/g, ' '), 22 + i * colW, y));
    y += 5;

    // data rows
    rows.slice(0, 20).forEach((row, ri) => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (ri % 2 === 0) {
        doc.setFillColor(248, 248, 252);
        doc.rect(20, y - 3.5, 170, 6, 'F');
      }
      doc.setTextColor(30, 30, 30);
      keys.forEach((k, i) => {
        const val = String(row[k] ?? '').substring(0, 20);
        doc.text(val, 22 + i * colW, y);
      });
      y += 6;
    });

    if (rows.length > 20) {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`... and ${rows.length - 20} more rows`, 24, y); y += 6;
    }
    y += 6;
  });

  return doc;
}

// ── Export configs ────────────────────────────────────────────────────────────

const EXPORTS = [
  {
    id: 'deals_csv',
    label: 'Deal Pipeline',
    desc: 'All deals with stage, priority & value',
    format: 'CSV',
    icon: Table,
    color: '#8b85f7',
  },
  {
    id: 'opportunities_csv',
    label: 'Sourced Opportunities',
    desc: 'AI-sourced deal opportunities & scores',
    format: 'CSV',
    icon: Table,
    color: '#00b7eb',
  },
  {
    id: 'investments_csv',
    label: 'Investments',
    desc: 'Portfolio investments & performance',
    format: 'CSV',
    icon: Table,
    color: '#10b981',
  },
  {
    id: 'full_report_pdf',
    label: 'Full Portfolio Report',
    desc: 'Deals, opportunities & investments as PDF',
    format: 'PDF',
    icon: FileText,
    color: '#ff8e42',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExportModal({ isOpen, onClose }) {
  const [downloading, setDownloading] = useState(null);
  const [done, setDone] = useState(null);

  const { data: deals = [] } = useQuery({
    queryKey: ['export-deals'],
    queryFn: () => base44.entities.DealPipeline.list(),
    enabled: isOpen,
  });
  const { data: opportunities = [] } = useQuery({
    queryKey: ['export-opportunities'],
    queryFn: () => base44.entities.SourcedDealOpportunity.list(),
    enabled: isOpen,
  });
  const { data: investments = [] } = useQuery({
    queryKey: ['export-investments'],
    queryFn: () => base44.entities.Investment.list(),
    enabled: isOpen,
  });

  const handleExport = async (exp) => {
    setDownloading(exp.id);
    const date = new Date().toISOString().split('T')[0];

    try {
      if (exp.id === 'deals_csv') {
        downloadCSV(`deals_${date}.csv`, toCSV(deals));
      } else if (exp.id === 'opportunities_csv') {
        downloadCSV(`opportunities_${date}.csv`, toCSV(opportunities));
      } else if (exp.id === 'investments_csv') {
        downloadCSV(`investments_${date}.csv`, toCSV(investments));
      } else if (exp.id === 'full_report_pdf') {
        const doc = generatePDF('Portfolio Report', [
          { heading: 'Deal Pipeline', rows: deals },
          { heading: 'Sourced Opportunities', rows: opportunities },
          { heading: 'Investments', rows: investments },
        ]);
        doc.save(`portfolio_report_${date}.pdf`);
      }
      setDone(exp.id);
      setTimeout(() => setDone(null), 2500);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a0f2e] border-[#2d1e50] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#8b85f7]" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {EXPORTS.map((exp) => {
            const Icon = exp.icon;
            const isLoading = downloading === exp.id;
            const isDone = done === exp.id;
            return (
              <div
                key={exp.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#2d1e50] bg-[#0f0618]/50 hover:border-[#8b85f7]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${exp.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: exp.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{exp.label}</p>
                    <p className="text-xs text-[#64748b]">{exp.desc}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExport(exp)}
                  disabled={!!downloading}
                  className={`min-w-[72px] text-xs ${
                    isDone
                      ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                      : 'bg-[#2d1e50] hover:bg-[#8b85f7]/20 text-[#8b85f7] border border-[#2d1e50]'
                  }`}
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isDone ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Done</>
                  ) : (
                    <><Download className="w-3 h-3 mr-1" /> {exp.format}</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#2d1e50] text-[#64748b]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}