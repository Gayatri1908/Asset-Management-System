import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AssetService } from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, QrCode, Shield, Calendar, DollarSign, Tag, Clock, User, Building, MapPin } from 'lucide-react';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const res = await AssetService.getById(id);
        if (res) {
          setAsset(res || {});
          try {
            const hist = await AssetService.getHistory(id);
            setHistory(hist?.data || hist);
          } catch (hErr) {
            console.error('History fetch failed', hErr);
          }
        }
      } catch (err) {
        toast.error('Failed to load asset details');
        navigate('/assets');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id, navigate]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading asset specifications and history...</div>;
  if (!asset) return <div style={{ padding: '3rem', textAlign: 'center' }}>Asset not found.</div>;

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'AVAILABLE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'ISSUED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'RETIRED': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/assets')}
          className="px-3.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assets Register
        </button>

        <Link
          to={`/verify?code=${asset.assetCode || `AST-${asset.id}`}`}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <QrCode className="w-3.5 h-3.5" /> Open in QR / Barcode Desk
        </Link>
      </div>

      {/* Main Asset Header Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 h-44 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={asset.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'}
            alt={asset.name || asset.assetName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md">
              {asset.assetCode || `AST-00${asset.id}`}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${getStatusBadge(asset.status)}`}>
              {asset.status || 'AVAILABLE'}
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              Category: {asset.category || 'Hardware'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {asset.name || asset.assetName}
          </h1>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {asset.description || asset.remarks || 'Standard enterprise hardware unit deployed for organization operations.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Brand / Model</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{asset.brand} ({asset.model || 'Standard'})</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Serial Number</span>
              <code className="font-bold text-gray-800 dark:text-gray-200">{asset.serialNumber}</code>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Purchase Price</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{Number(asset.purchasePrice || asset.purchaseCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Vendor / Source</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{asset.vendor || 'Authorized Supplier'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Attributes & Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <MapPin className="w-4 h-4 text-blue-500" /> Physical Location
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            {asset.location || 'Bengaluru HQ - Floor 3 IT Staging'}
          </div>
          <div className="text-xs text-gray-400">
            Assigned Storage Bay: Shelf B-12
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Shield className="w-4 h-4 text-emerald-500" /> Warranty Coverage
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            {asset.warrantyExpiry || asset.warrantyPeriod || '24 Months Active Warranty'}
          </div>
          <div className="text-xs text-gray-400">
            OEM Vendor Replacement SLA active
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <User className="w-4 h-4 text-violet-500" /> Current Custody
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            {history?.currentIssue?.employeeName ? `${history.currentIssue.employeeName} (${history.currentIssue.department || 'IT'})` : 'In IT Storage Bay'}
          </div>
          <div className="text-xs text-gray-400">
            Status: {asset.status}
          </div>
        </div>
      </div>

      {/* Asset Audit & Custody Timeline */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-500" /> Assignment & Custody Timeline
        </h3>

        {history?.assignmentHistory && history.assignmentHistory.length > 0 ? (
          <div className="space-y-3">
            {history.assignmentHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">Assigned to {item.employeeName}</span>
                  <div className="text-gray-400 font-mono text-[11px]">Issued: {item.issueDate} • Due: {item.expectedReturnDate || 'N/A'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.status === 'ISSUED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 py-3">
            No previous return history recorded for this unit. Current status is {asset.status}.
          </div>
        )}
      </div>
    </div>
  );
}
