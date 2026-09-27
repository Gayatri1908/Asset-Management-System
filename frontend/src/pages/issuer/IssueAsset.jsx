import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService, EmployeePortalService } from '../../services/api';
import { CheckCircle, Package, User, Calendar, Shield, Sparkles } from 'lucide-react';

export default function IssueAsset() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [conditionBeforeIssue, setConditionBeforeIssue] = useState('Excellent / Working');
  const [accessories, setAccessories] = useState('Power Adapter, Charging Cable, Laptop Bag');
  const [remarks, setRemarks] = useState('');

  const fetchInitial = async () => {
    try {
      const [empRes, assetRes] = await Promise.all([
        IssuerService.searchEmployees(''),
        EmployeePortalService.getAvailableAssets()
      ]);
      const empList = Array.isArray(empRes) ? empRes : (empRes?.content || empRes?.data || []);
      const assetList = Array.isArray(assetRes) ? assetRes : (assetRes?.content || assetRes?.data || []);
      setEmployees(empList);
      setAssets(assetList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load initial data');
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !selectedEmployee) {
      toast.error('Please select both an employee and an available asset.');
      return;
    }

    try {
      setLoading(true);
      const combinedRemarks = `${remarks ? remarks + ' | ' : ''}Accessories: ${accessories} | Condition: ${conditionBeforeIssue}`;
      await IssuerService.issueAsset({
        assetId: parseInt(selectedAsset),
        employeeId: parseInt(selectedEmployee),
        expectedReturnDate: expectedReturnDate ? expectedReturnDate + "T00:00:00" : null,
        remarks: combinedRemarks,
        conditionAtIssue: conditionBeforeIssue
      });
      toast.success('Asset successfully issued! Status transitioned: AVAILABLE → ISSUED');
      setSelectedEmployee('');
      setSelectedAsset('');
      setExpectedReturnDate('');
      setRemarks('');
      fetchInitial();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to issue asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Physical Asset Handover / Direct Issue</h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Perform formal physical asset handover, record baseline hardware condition, and dispatch accessories.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select Recipient Employee <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              required
            >
              <option value="">Choose Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.user?.name || e.fullName} ({e.department?.name || 'General'} - {e.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select Available Hardware Asset <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              required
            >
              <option value="">Choose Available Asset from Stockroom...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetCode || `AST-${a.id}`} - {a.name || a.assetName} ({a.category} • SN: {a.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Condition Before Issue
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                value={conditionBeforeIssue}
                onChange={e => setConditionBeforeIssue(e.target.value)}
              >
                <option value="Brand New">Brand New (Sealed)</option>
                <option value="Excellent / Working">Excellent / Fully Functional</option>
                <option value="Good (Minor Wear)">Good (Minor Cosmetic Wear)</option>
                <option value="Fair">Fair (Operational)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Return Date
              </label>
              <input 
                type="date" 
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                value={expectedReturnDate} 
                onChange={e => setExpectedReturnDate(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Included Accessories
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              value={accessories} 
              onChange={e => setAccessories(e.target.value)} 
              placeholder="e.g. 65W USB-C Charger, Mouse, HDMI Cable, Security Lock"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Handover Remarks / Special Instructions
            </label>
            <textarea 
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              rows={3} 
              placeholder="e.g. Asset inspected and handed over with original company tags."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" /> {loading ? 'Issuing Hardware...' : 'Complete Asset Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
