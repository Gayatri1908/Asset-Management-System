import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AssetService } from '../services/api';
import AssetTable from '../components/tables/AssetTable';
import Modal from '../components/common/Modal';
import AssetForm from '../components/forms/AssetForm';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await AssetService.getAll();
      setAssets(res?.content || res || []);
    } catch (err) {
      toast.error('Failed to fetch assets from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (newAsset) => {
    try {
      const assetPayload = {
        assetCode: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newAsset.assetName,
        category: newAsset.category,
        brand: newAsset.brand,
        serialNumber: newAsset.serialNumber,
        purchasePrice: newAsset.purchaseCost ? parseFloat(newAsset.purchaseCost) : 0,
        location: newAsset.location,
        status: 'AVAILABLE',
        remarks: newAsset.description,
        quantity: parseInt(newAsset.quantity) || 1
      };
      
      await AssetService.create(assetPayload);
      toast.success(`Asset "${newAsset.assetName}" saved to MySQL!`);
      setIsAddModalOpen(false);
      fetchAssets();
    } catch (err) {
      toast.error('Failed to save asset to MySQL');
    }
  };

  const handleUpdateAsset = async (updatedData) => {
    try {
      const assetPayload = {
        name: updatedData.assetName || updatedData.name,
        category: updatedData.category,
        brand: updatedData.brand,
        serialNumber: updatedData.serialNumber,
        purchasePrice: updatedData.purchaseCost ? parseFloat(updatedData.purchaseCost) : updatedData.purchasePrice,
        location: updatedData.location,
        status: updatedData.status || 'AVAILABLE',
        remarks: updatedData.description || updatedData.remarks,
        quantity: parseInt(updatedData.quantity) || 1
      };

      await AssetService.update(editingAsset.id, assetPayload);
      toast.success(`Asset updated in MySQL!`);
      setEditingAsset(null);
      fetchAssets();
    } catch (err) {
      toast.error('Failed to update asset');
    }
  };

  const handleDeleteAsset = async () => {
    try {
      await AssetService.delete(deletingAsset.id);
      toast.success(`Asset deleted from MySQL.`);
      setDeletingAsset(null);
      fetchAssets();
    } catch (err) {
      toast.error('Failed to delete asset');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>All Hardware Assets</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Asset registry, issuing, and life-cycle management.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          + Add Asset
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading assets from database...</div>
      ) : (
        <AssetTable
          assets={assets.map(a => ({
            ...a, 
            assetName: a.name, 
            purchaseCost: a.purchasePrice,
            description: a.remarks
          }))}
          onView={(asset) => navigate(`/assets/${asset.id}`)}
          onEdit={(asset) => setEditingAsset(asset)}
          onDelete={(asset) => setDeletingAsset(asset)}
          onAddNewAsset={() => setIsAddModalOpen(true)}
        />
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Asset">
        <AssetForm onSubmit={handleAddAsset} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingAsset} onClose={() => setEditingAsset(null)} title="Edit Asset">
        {editingAsset && (
          <AssetForm initialValues={editingAsset} onSubmit={handleUpdateAsset} onCancel={() => setEditingAsset(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deletingAsset} onClose={() => setDeletingAsset(null)} title="Delete Asset">
        <p style={{ marginBottom: '1rem' }}>Are you sure you want to delete {deletingAsset?.name || deletingAsset?.assetName} ({deletingAsset?.assetCode || deletingAsset?.id})?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={() => setDeletingAsset(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleDeleteAsset} className="btn btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
