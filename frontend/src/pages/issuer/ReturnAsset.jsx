import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService } from '../../services/api';
import { CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';

export default function ReturnAsset() {
  const [loading, setLoading] = useState(false);
  const [activeIssues, setActiveIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [accessoriesReturned, setAccessoriesReturned] = useState(true);
  const [damageRemarks, setDamageRemarks] = useState('');
  const [issuerRemarks, setIssuerRemarks] = useState('');

  const fetchActiveIssues = async () => {
    try {
      const hist = await IssuerService.getIssueHistory();
      const active = (hist || []).filter(i => (i.status || '').toUpperCase() === 'ISSUED');
      setActiveIssues(active);
      if (active.length > 0 && !selectedIssueId) {
        setSelectedIssueId(String(active[0].id));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active asset assignments');
    }
  };

  useEffect(() => {
    fetchActiveIssues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssueId) {
      toast.error('Please select an active issue assignment');
      return;
    }

    try {
      setLoading(true);
      const combinedRemarks = `${issuerRemarks ? issuerRemarks + ' | ' : ''}Accessories Returned: ${accessoriesReturned ? 'Yes' : 'Missing'} | Damage: ${damageRemarks || 'None'}`;
      
      await IssuerService.directReturnAsset({
        issueId: parseInt(selectedIssueId),
        returnCondition: returnCondition.toUpperCase(),
        remarks: combinedRemarks
      });

      if (returnCondition === 'DAMAGED' || returnCondition === 'MAINTENANCE') {
        toast.success('Asset marked DAMAGED. Transitioned to MAINTENANCE status and diagnostic ticket created!', { duration: 5000 });
      } else {
        toast.success('Asset inspected in GOOD condition. Successfully returned to AVAILABLE stock!', { duration: 4000 });
      }

      setSelectedIssueId('');
      setDamageRemarks('');
      setIssuerRemarks('');
      fetchActiveIssues();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to process asset return');
    } finally {
      setLoading(false);
    }
  };

  const selectedIssue = activeIssues.find(i => String(i.id) === String(selectedIssueId));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Physical Return Inspection & Check-in</h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Perform formal physical asset inspection, verify returned accessories, and route to Available or Maintenance.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select Active Hardware Assignment <span className="text-red-500">*</span>
            </label>
            {activeIssues.length === 0 ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 text-center">
                No active asset assignments currently in circulation.
              </div>
            ) : (
              <select
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                value={selectedIssueId}
                onChange={e => setSelectedIssueId(e.target.value)}
                required
              >
                {activeIssues.map(i => (
                  <option key={i.id} value={i.id}>
                    ISS-00{i.id} • {i.assetCode} - {i.assetName} (Held by: {i.employeeName})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedIssue && (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-200">
                Asset: {selectedIssue.assetName} ({selectedIssue.assetCode})
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                Custodian: {selectedIssue.employeeName} • Issued: {selectedIssue.issueDate}
              </div>
              {selectedIssue.expectedReturnDate && (
                <div className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                  Scheduled Return: {selectedIssue.expectedReturnDate}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Physical Inspection Outcome <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
                value={returnCondition}
                onChange={e => setReturnCondition(e.target.value)}
                required
              >
                <option value="GOOD">Good Condition → Set AVAILABLE</option>
                <option value="DAMAGED">Damaged / Malfunction → Set MAINTENANCE</option>
                <option value="LOST">Lost / Unreturned → Route to Audit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Accessories Check
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessoriesReturned}
                  onChange={e => setAccessoriesReturned(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300 font-semibold">
                  All accessories intact & verified
                </span>
              </label>
            </div>
          </div>

          {returnCondition === 'DAMAGED' && (
            <div>
              <label className="block font-semibold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Hardware Damage Description
              </label>
              <textarea
                required
                className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl text-gray-900 dark:text-white"
                value={damageRemarks}
                onChange={e => setDamageRemarks(e.target.value)}
                rows={2}
                placeholder="Describe screen crack, water damage, or hardware defects detected..."
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Officer Inspection Remarks
            </label>
            <textarea
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              value={issuerRemarks}
              onChange={e => setIssuerRemarks(e.target.value)}
              rows={2}
              placeholder="e.g. Factory reset confirmed, serial sticker verified, placed in staging bay."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || activeIssues.length === 0}
              className={`w-full py-2.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all ${
                returnCondition === 'DAMAGED'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {returnCondition === 'DAMAGED' ? (
                <>
                  <Wrench className="w-4 h-4" /> {loading ? 'Processing...' : 'Complete Return → Route to Maintenance'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {loading ? 'Processing...' : 'Complete Return → Restore to Available'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
