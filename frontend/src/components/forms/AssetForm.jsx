import React from 'react';
import { useForm } from 'react-hook-form';

export default function AssetForm({ initialValues, onSubmit, onCancel, categories = [], vendors = [], departments = [] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues || {
      assetName: '',
      category: 'Laptops & Workstations',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: '',
      vendor: vendors[0]?.name || 'Tata Consultancy Hardware Supplies',
      department: departments[0]?.name || 'Engineering',
      location: 'Bengaluru HQ - Floor 3 IT Staging',
      quantity: 1,
      minimumStock: 5,
      warrantyStart: new Date().toISOString().split('T')[0],
      warrantyEnd: '2027-01-01',
      description: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Asset Name *</label>
          <input
            type="text"
            {...register('assetName', { required: 'Name is required' })}
            placeholder="e.g. MacBook Pro 16 M3 Max"
            className="form-control"
          />
          {errors.assetName && <span style={{ color: 'var(--danger-color)', fontSize: '11px' }}>{errors.assetName.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select {...register('category')} className="form-control">
            {['Laptops & Workstations', 'Monitors & Displays', 'Peripherals & Accessories', 'Mobile Devices & Tablets', 'Office Infrastructure & Furniture'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Brand</label>
          <input type="text" {...register('brand')} placeholder="e.g. Apple, Dell, Lenovo" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Model</label>
          <input type="text" {...register('model')} placeholder="e.g. XPS 15 9530" className="form-control" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Serial Number *</label>
          <input
            type="text"
            {...register('serialNumber', { required: 'Serial number is required' })}
            placeholder="e.g. SN-BLR-98421"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select {...register('department')} className="form-control">
            {['Engineering', 'IT Support & Infrastructure', 'Product & UI/UX Design', 'Human Resources', 'Operations & Logistics'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Vendor</label>
          <input type="text" {...register('vendor')} placeholder="e.g. Tata Consultancy, Wipro" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input type="text" {...register('location')} placeholder="e.g. Bengaluru HQ - Floor 3 Bay B" className="form-control" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input type="number" min="1" {...register('quantity')} className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Purchase Cost (₹ INR)</label>
          <input type="text" {...register('purchaseCost')} placeholder="e.g. 185000" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea rows={3} {...register('description')} className="form-control" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="button" onClick={() => reset()} className="btn btn-secondary">Reset</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Save Asset</button>
      </div>
    </form>
  );
}
