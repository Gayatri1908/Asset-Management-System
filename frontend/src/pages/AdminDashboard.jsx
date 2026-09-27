import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { DashboardService, AssetService } from '../services/api';
import KpiCard from '../components/cards/KpiCard';
import QuickActions from '../components/cards/QuickActions';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyPurchasesChart from '../components/charts/MonthlyPurchasesChart';
import StatusDoughnutChart from '../components/charts/StatusDoughnutChart';
import Modal from '../components/common/Modal';
import AssetForm from '../components/forms/AssetForm';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    issuedAssets: 0,
    assetsUnderMaintenance: 0,
    retiredAssets: 0,
    totalEmployees: 0,
    pendingRequests: 0,
    overdueReturns: 0
  });
  
  const [assets, setAssets] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const [statsRes, assetsRes] = await Promise.all([
        DashboardService.getStats(),
        AssetService.getAll()
      ]);
      
      if (statsRes) {
        setStats(statsRes);
      }
      
      if (assetsRes) {
        setAssets(assetsRes.content || assetsRes || []);
      }
    } catch (err) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateAsset = async (newAssetData) => {
    try {
      const assetPayload = {
        assetCode: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newAssetData.assetName,
        category: newAssetData.category,
        brand: newAssetData.brand,
        serialNumber: newAssetData.serialNumber,
        purchasePrice: newAssetData.purchaseCost ? parseFloat(newAssetData.purchaseCost) : 0,
        location: newAssetData.location,
        status: 'AVAILABLE',
        remarks: newAssetData.description,
        quantity: parseInt(newAssetData.quantity) || 1
      };
      
      await AssetService.create(assetPayload);
      setIsAddModalOpen(false);
      toast.success(`Asset "${newAssetData.assetName}" saved to MySQL!`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to save asset to database');
    }
  };

  // Compute Chart Data Dynamically from Live Assets
  const computeCategoryData = () => {
    if (!assets.length) return [{ name: 'No Data', value: 1, color: '#ccc' }];
    const counts = {};
    assets.forEach(a => { counts[a.category || 'Other'] = (counts[a.category || 'Other'] || 0) + 1; });
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#64748b'];
    return Object.keys(counts).map((key, index) => ({
      name: key,
      value: counts[key],
      color: colors[index % colors.length]
    }));
  };

  const computeStatusData = () => {
    if (!assets.length) return [{ name: 'No Data', value: 1, color: '#ccc' }];
    const counts = {};
    assets.forEach(a => { counts[a.status || 'AVAILABLE'] = (counts[a.status || 'AVAILABLE'] || 0) + 1; });
    const colors = ['#10b981', '#f59e0b', '#ec4899', '#6366f1'];
    return Object.keys(counts).map((key, index) => ({
      name: key,
      value: counts[key],
      color: colors[index % colors.length]
    }));
  };

  const computeMonthlyPurchases = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    // Generate last 6 months list
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6.push({ month: months[idx], monthIndex: idx, amount: 0 });
    }

    assets.forEach(a => {
      const cost = Number(a.purchasePrice || a.purchaseCost || 0);
      if (a.purchaseDate) {
        const d = new Date(a.purchaseDate);
        if (!isNaN(d.getTime())) {
          const mIdx = d.getMonth();
          const target = last6.find(item => item.monthIndex === mIdx);
          if (target) {
            target.amount += cost;
          }
        }
      }
    });

    return last6.map(({ month, amount }) => ({ month, amount }));
  };

  const lowStockAlerts = assets.filter(a => (a.quantity || 1) < 5).map(a => ({
    id: a.id,
    item: a.name || 'Unknown Asset',
    count: a.quantity || 1,
    threshold: 5
  }));

  const warrantyAlerts = assets.filter(a => a.status === 'AVAILABLE' || a.status === 'ISSUED').slice(0, 4).map(a => {
    const pDate = a.purchaseDate ? new Date(a.purchaseDate) : new Date();
    const expiry = new Date(pDate);
    expiry.setFullYear(expiry.getFullYear() + 2); // 2-year standard enterprise warranty
    const days = Math.max(1, Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    return {
      id: a.id,
      name: a.name || a.assetName || 'Asset',
      endDate: expiry.toISOString().split('T')[0],
      daysRemaining: days
    };
  });

  return (
    <div>
      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Asset availability, stock alerts, and maintenance operations.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          + Add Asset
        </button>
      </div>

      {/* KPI Cards Grid - Enterprise 8 KPIs */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KpiCard title="Total Assets" count={stats.totalAssets || 0} change={`${stats.totalAssets || 0} registered assets`} isPositive={true} />
        <KpiCard title="Available Assets" count={stats.availableAssets || 0} change={`${stats.availableAssets || 0} ready for issuance`} isPositive={true} />
        <KpiCard title="Issued Assets" count={stats.issuedAssets || 0} change={`${stats.issuedAssets || 0} active assignments`} isPositive={false} />
        <KpiCard title="Under Maintenance" count={stats.assetsUnderMaintenance || 0} change={`${stats.assetsUnderMaintenance || 0} tickets in progress`} isPositive={true} />
        <KpiCard title="Retired Assets" count={stats.retiredAssets || 0} change={`${stats.retiredAssets || 0} decommissioned units`} isPositive={true} />
        <KpiCard title="Total Employees" count={stats.totalEmployees || 0} change={`${stats.totalEmployees || 0} staff members`} isPositive={true} />
        <KpiCard title="Pending Requests" count={stats.pendingRequests || 0} change={`${stats.pendingRequests || 0} awaiting approval`} isPositive={false} />
        <KpiCard title="Overdue Returns" count={stats.overdueReturns || 0} change={`${stats.overdueReturns || 0} overdue units`} isPositive={false} />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onOpenAddAsset={() => setIsAddModalOpen(true)}
        onOpenAddCategory={() => navigate('/categories')}
        onOpenAddVendor={() => navigate('/vendors')}
      />

      {/* Charts Grid */}
      <div className="grid-charts">
        <CategoryPieChart data={computeCategoryData()} />
        <MonthlyPurchasesChart data={computeMonthlyPurchases()} />
        <StatusDoughnutChart data={computeStatusData()} />
      </div>

      {/* Low Stock & Warranty Alerts */}
      <div className="grid-charts">
        {/* Low Stock Alerts */}
        <div className="chart-card">
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="chart-title">Low Stock Inventory Alerts</h3>
            <button onClick={() => navigate('/low-stock-alerts')} className="btn btn-secondary btn-sm">View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {lowStockAlerts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No low stock alerts.</div>
            ) : (
              lowStockAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-main)' }}>
                  <div>
                    <strong>{alert.item}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Threshold: {alert.threshold} units</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger">Only {alert.count} Left</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warranty Expirations */}
        <div className="chart-card">
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="chart-title">Warranty Expirations</h3>
            <button onClick={() => navigate('/warranty-alerts')} className="btn btn-secondary btn-sm">View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {warrantyAlerts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No warranty expirations.</div>
            ) : (
              warrantyAlerts.slice(0, 4).map((w) => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-main)' }}>
                  <div>
                    <strong>{w.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expiry: {w.endDate}</div>
                  </div>
                  <span className="badge badge-warning">{w.daysRemaining} Days Left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Asset">
        <AssetForm onSubmit={handleCreateAsset} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  );
}
