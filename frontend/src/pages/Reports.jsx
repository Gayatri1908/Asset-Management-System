import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileType,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Wrench,
  ShieldAlert,
  ShoppingCart,
  Users,
  Clock,
  Printer
} from 'lucide-react';
import { AssetService, IssuerService, MaintenanceService, EmployeeService, AuditService } from '../services/api';
import { toast } from 'react-hot-toast';

export default function Reports() {
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [generating, setGenerating] = useState(false);

  const reportCards = [
    { id: 'inventory', title: 'Asset Inventory Report', desc: 'Complete breakdown of all registered hardware, serial numbers, categories, vendors, and valuation.', icon: Layers, color: 'blue' },
    { id: 'issued', title: 'Issued Asset Report', desc: 'Active physical asset assignments with custodian employee details and issue timestamps.', icon: Users, color: 'cyan' },
    { id: 'returned', title: 'Returned Asset Report', desc: 'Log of returned hardware, recorded post-return physical condition, and damage remarks.', icon: FileText, color: 'emerald' },
    { id: 'employee', title: 'Employee-wise Asset Report', desc: 'Hardware custody allocations per staff member, department distribution, and contacts.', icon: BarChart3, color: 'purple' },
    { id: 'maintenance', title: 'Maintenance & Repair Report', desc: 'Hardware diagnostic tickets, maintenance costs, servicing vendors, and repair statuses.', icon: Wrench, color: 'rose' },
    { id: 'overdue', title: 'Overdue Asset Report', desc: 'Tracked hardware where scheduled return deadlines have elapsed without physical check-in.', icon: Clock, color: 'amber' },
    { id: 'history', title: 'Asset History & Audit Trail', desc: 'Immutable timeline of state transitions, administrative approvals, and custody handovers.', icon: ShieldAlert, color: 'red' },
  ];

  const downloadCsv = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename}.csv generated and downloaded!`);
  };

  const printReportWindow = (title, headers, rows) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up was blocked. Please allow pop-ups to print PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; color: #1e293b; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
            .meta { font-size: 0.85rem; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.85rem; }
            th { background: #f1f5f9; text-align: left; padding: 0.6rem 0.8rem; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #334155; }
            td { padding: 0.6rem 0.8rem; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; background: #e0f2fe; color: #0369a1; }
            .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8; display: flex; justify-content: space-between; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${title}</h1>
              <div class="meta">Asset Issue and Return Management Desk (AIMS Enterprise)</div>
            </div>
            <div class="meta" style="text-align: right;">
              <div>Generated: ${new Date().toLocaleString()}</div>
              <div>Confidential Internal Document</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(r => `<tr>${r.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            <span>Total Records: ${rows.length}</span>
            <span>Generated via AIMS Reporting Engine</span>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success(`Print preview opened for ${title}`);
  };

  const handleGenerateReport = async (report) => {
    setGenerating(true);
    toast.loading(`Gathering live data for ${report.title}...`, { id: 'rep-load' });

    try {
      let headers = [];
      let rows = [];
      const isPdf = selectedFormat === 'PDF';

      if (report.id === 'inventory') {
        const assets = await AssetService.getAll() || [];
        headers = ['Asset Code', 'Name', 'Category', 'Brand/Model', 'Serial No', 'Purchase Cost (INR)', 'Status', 'Vendor'];
        rows = assets.map(a => [
          a.assetCode || `AST-${a.id}`,
          a.assetName || a.name,
          a.category,
          `${a.brand || ''} ${a.model || ''}`.trim(),
          a.serialNumber,
          (a.purchaseCost || a.purchasePrice) ? `₹${Number(a.purchaseCost || a.purchasePrice).toLocaleString('en-IN')}` : '—',
          a.status,
          a.vendor || '—'
        ]);
      } else if (report.id === 'issued') {
        const issues = await IssuerService.getIssueHistory() || [];
        const activeIssues = issues.filter(i => (i.status || '').toUpperCase() === 'ISSUED');
        headers = ['Issue ID', 'Asset Code', 'Asset Name', 'Employee', 'Department', 'Issue Date', 'Expected Return'];
        rows = activeIssues.map(i => [
          `ISS-00${i.id}`,
          i.assetCode,
          i.assetName,
          i.employeeName,
          i.department || 'General',
          i.issueDate,
          i.expectedReturnDate || '—'
        ]);
      } else if (report.id === 'returned') {
        const returns = await IssuerService.getReturnHistory() || [];
        headers = ['Return ID', 'Asset Code', 'Asset Name', 'Employee', 'Return Date', 'Condition', 'Remarks'];
        rows = returns.map(r => [
          `RET-00${r.id}`,
          r.assetCode,
          r.assetName,
          r.employeeName,
          r.returnDate,
          r.conditionAfterReturn || 'GOOD',
          r.damageRemarks || 'None'
        ]);
      } else if (report.id === 'employee') {
        const employees = await EmployeeService.getAll() || [];
        headers = ['Employee Code', 'Full Name', 'Department', 'Designation', 'Email', 'Phone', 'Active Status'];
        rows = employees.map(e => [
          e.employeeCode,
          e.fullName,
          e.departmentName || '—',
          e.designation || 'Staff',
          e.email,
          e.phone || '—',
          e.isActive ? 'Active' : 'Inactive'
        ]);
      } else if (report.id === 'maintenance') {
        const records = await MaintenanceService.getAll() || [];
        headers = ['Ticket ID', 'Asset Code', 'Problem Description', 'Vendor', 'Repair Cost (INR)', 'Status', 'Start Date'];
        rows = records.map(m => [
          `MNT-00${m.id}`,
          m.assetCode || `AST-${m.assetId}`,
          m.problemDescription,
          m.vendor || 'Authorized Service',
          m.cost ? `₹${Number(m.cost).toLocaleString('en-IN')}` : '₹0.00',
          m.status,
          m.maintenanceDate || '—'
        ]);
      } else if (report.id === 'overdue') {
        const issues = await IssuerService.getIssueHistory() || [];
        const today = new Date().toISOString().split('T')[0];
        const overdueList = issues.filter(i => 
          (i.status || '').toUpperCase() === 'ISSUED' && 
          i.expectedReturnDate && 
          i.expectedReturnDate < today
        );
        headers = ['Issue ID', 'Asset Code', 'Asset Name', 'Employee', 'Issue Date', 'Due Date', 'Days Overdue'];
        rows = overdueList.map(i => {
          const diffTime = Math.abs(new Date() - new Date(i.expectedReturnDate));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return [
            `ISS-00${i.id}`,
            i.assetCode,
            i.assetName,
            i.employeeName,
            i.issueDate,
            i.expectedReturnDate,
            `${diffDays} days`
          ];
        });
      } else if (report.id === 'history') {
        const logs = await AuditService.getAll() || [];
        headers = ['Log ID', 'Timestamp', 'Actor', 'Action', 'Asset Code', 'Details'];
        rows = logs.map(l => [
          `AUD-${l.id}`,
          l.createdAt ? new Date(l.createdAt).toLocaleString() : '—',
          l.username,
          l.action,
          l.assetCode || '—',
          l.details
        ]);
      }

      toast.dismiss('rep-load');

      if (isPdf) {
        printReportWindow(report.title, headers, rows);
      } else {
        // Build CSV string
        const escapeCsv = (str) => `"${String(str ?? '').replace(/"/g, '""')}"`;
        const csvHeader = headers.map(escapeCsv).join(',');
        const csvRows = rows.map(r => r.map(escapeCsv).join(',')).join('\n');
        const fullCsv = `${csvHeader}\n${csvRows}`;
        downloadCsv(report.title.replace(/\s+/g, '_'), fullCsv);
      }
    } catch (err) {
      toast.dismiss('rep-load');
      console.error(err);
      toast.error(`Failed to compile ${report.title}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Executive Reports & Data Export</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Export real-time audit reports, hardware inventory logs, return damage reports, and printable slips.
          </p>
        </div>

        {/* Global Export Format Picker */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-bold text-gray-500 pl-2">Export Format:</span>
          {['CSV', 'Excel', 'PDF'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFormat === fmt
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportCards.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    Live Data
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{r.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400">Database connected</span>
                <button
                  disabled={generating}
                  onClick={() => handleGenerateReport(r)}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  {selectedFormat === 'PDF' ? <Printer className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  Export {selectedFormat}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
