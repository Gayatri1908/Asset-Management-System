import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AssetTable({
  assets = [],
  onView,
  onEdit,
  onDelete,
  onAssign,
  onReturn,
  onReserve,
  onMaintenance,
  onAddNewAsset,
  initialSearchQuery = ''
}) {
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const navigate = useNavigate();

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const idStr = String(asset.assetCode || asset.id || '').toLowerCase();
      const nameStr = String(asset.assetName || '').toLowerCase();
      const serialStr = String(asset.serialNumber || '').toLowerCase();
      const q = search.toLowerCase();

      const matchSearch =
        search === '' ||
        idStr.includes(q) ||
        nameStr.includes(q) ||
        serialStr.includes(q);

      const catStr = asset.category || '';
      const matchCat = selectedCategory === 'All' || catStr.toLowerCase() === selectedCategory.toLowerCase();

      const statStr = (asset.status || '').toUpperCase();
      const selectedUpper = selectedStatus.toUpperCase();
      const matchStatus =
        selectedStatus === 'All' ||
        statStr === selectedUpper ||
        (selectedUpper === 'AVAILABLE' && statStr === 'AVAILABLE') ||
        (selectedUpper === 'ISSUED' && statStr === 'ISSUED') ||
        (selectedUpper === 'UNDER MAINTENANCE' && (statStr === 'MAINTENANCE' || statStr === 'UNDER MAINTENANCE')) ||
        (selectedUpper === 'DAMAGED' && (statStr === 'DAMAGED' || statStr === 'MAINTENANCE'));

      return matchSearch && matchCat && matchStatus;
    });
  }, [assets, search, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filteredAssets.length / pageSize) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, currentPage, pageSize]);

  const getBadgeClass = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'AVAILABLE': return 'badge badge-success';
      case 'ISSUED': return 'badge badge-info';
      case 'RESERVED': return 'badge badge-warning';
      case 'DAMAGED': return 'badge badge-danger';
      case 'MAINTENANCE':
      case 'UNDER MAINTENANCE': return 'badge badge-warning';
      case 'RETIRED': return 'badge';
      default: return 'badge';
    }
  };

  return (
    <div className="table-container">
      {/* Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search assets..."
            className="search-input"
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="All">All Categories</option>
            {Array.from(new Set(assets.map(a => a.category).filter(Boolean))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Issued">Issued</option>
            <option value="Reserved">Reserved</option>
            <option value="Damaged">Damaged</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        {onAddNewAsset && (
          <button onClick={onAddNewAsset} className="btn btn-primary btn-sm">
            + Add Asset
          </button>
        )}
      </div>

      {/* Simple Table */}
      <table className="simple-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Asset Name</th>
            <th>Category</th>
            <th>Brand / Model</th>
            <th>Serial No.</th>
            <th>Department</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                No assets found.
              </td>
            </tr>
          ) : (
            paginatedAssets.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <strong 
                    style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    {asset.assetCode || asset.id}
                  </strong>
                </td>
                <td>
                  <strong>{asset.assetName}</strong>
                </td>
                <td>{asset.category}</td>
                <td>{asset.brand} ({asset.model})</td>
                <td><code>{asset.serialNumber}</code></td>
                <td>{asset.department}</td>
                <td>
                  <span className={getBadgeClass(asset.status)}>
                    {asset.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', justifyRight: 'flex-end', justifyContent: 'flex-end' }}>
                    <button onClick={() => onView && onView(asset)} className="btn btn-secondary btn-sm">View</button>
                    <button onClick={() => onEdit && onEdit(asset)} className="btn btn-secondary btn-sm">Edit</button>
                    <button onClick={() => onDelete && onDelete(asset)} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ padding: '0.8rem 1rem', display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Page {currentPage} of {totalPages}</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
