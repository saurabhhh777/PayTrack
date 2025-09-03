import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Partner {
  name: string;
  mobile: string;
  contribution: number;
}

interface MeelRecord {
  _id: string;
  cropName: string;
  transactionType: 'Buy' | 'Sell';
  transactionMode: 'Individual' | 'With Partner';
  partners?: Partner[];
  totalCost: number;
  tag: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

const Meel: React.FC = () => {
  const [meelRecords, setMeelRecords] = useState<MeelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMeel, setEditingMeel] = useState<MeelRecord | null>(null);
  const [filters, setFilters] = useState({
    transactionType: '',
    transactionMode: '',
    tag: '',
    cropName: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    cropName: '',
    transactionType: 'Buy' as 'Buy' | 'Sell',
    transactionMode: 'Individual' as 'Individual' | 'With Partner',
    totalCost: '',
    tag: '',
    partners: [] as Partner[]
  });

  // Partner form state
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    mobile: '',
    contribution: ''
  });

  useEffect(() => {
    fetchMeelRecords();
  }, [filters, pagination.page]);

  const fetchMeelRecords = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/meel?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMeelRecords(data.meelRecords);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching meel records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMeel 
        ? `/api/meel/${editingMeel._id}`
        : '/api/meel';
      
      const method = editingMeel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          totalCost: parseFloat(formData.totalCost),
          partners: formData.transactionMode === 'With Partner' ? formData.partners : undefined
        })
      });

      if (response.ok) {
        setShowForm(false);
        setEditingMeel(null);
        resetForm();
        fetchMeelRecords();
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving meel record');
      }
    } catch (error) {
      console.error('Error saving meel record:', error);
      alert('Error saving meel record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meel record?')) return;

    try {
      const response = await fetch(`/api/meel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchMeelRecords();
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting meel record');
      }
    } catch (error) {
      console.error('Error deleting meel record:', error);
      alert('Error deleting meel record');
    }
  };

  const handleEdit = (meelRecord: MeelRecord) => {
    setEditingMeel(meelRecord);
    setFormData({
      cropName: meelRecord.cropName,
      transactionType: meelRecord.transactionType,
      transactionMode: meelRecord.transactionMode,
      totalCost: meelRecord.totalCost.toString(),
      tag: meelRecord.tag,
      partners: meelRecord.partners || []
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      cropName: '',
      transactionType: 'Buy',
      transactionMode: 'Individual',
      totalCost: '',
      tag: '',
      partners: []
    });
    setPartnerForm({
      name: '',
      mobile: '',
      contribution: ''
    });
  };

  const addPartner = () => {
    if (partnerForm.name && partnerForm.mobile && partnerForm.contribution) {
      setFormData(prev => ({
        ...prev,
        partners: [...prev.partners, {
          name: partnerForm.name,
          mobile: partnerForm.mobile,
          contribution: parseFloat(partnerForm.contribution)
        }]
      }));
      setPartnerForm({ name: '', mobile: '', contribution: '' });
    }
  };

  const removePartner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
  };

  const getTypeEmoji = (type: string) => type === 'Buy' ? '🛒' : '💰';
  const getModeEmoji = (mode: string) => mode === 'Individual' ? '👤' : '👥';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏭 Meel Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Meel Record
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Name
            </label>
            <input
              type="text"
              placeholder="Search by crop name..."
              value={filters.cropName}
              onChange={(e) => setFilters(prev => ({ ...prev, cropName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Mode
            </label>
            <select
              value={filters.transactionMode}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionMode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modes</option>
              <option value="Individual">Individual</option>
              <option value="With Partner">With Partner</option>
            </select>
          </div>
          
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <input
              type="text"
              placeholder="Filter by tag..."
              value={filters.tag}
              onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Meel Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingMeel ? 'Edit Meel Record' : 'Add New Meel Record'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingMeel(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name of Crop *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cropName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cropName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Wheat, Rice, Cotton"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    required
                    value={formData.transactionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionType: e.target.value as 'Buy' | 'Sell' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Mode *
                  </label>
                  <select
                    required
                    value={formData.transactionMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionMode: e.target.value as 'Individual' | 'With Partner' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Individual">Individual</option>
                    <option value="With Partner">With Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost of Crop *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalCost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Wheat, Rice, Cotton, Seasonal"
                  />
                </div>
              </div>

              {/* Partner Section */}
              {formData.transactionMode === 'With Partner' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">👥 Partners</h3>
                  
                  {/* Add Partner Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Partner Name"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Partner Mobile No."
                      value={partnerForm.mobile}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, mobile: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Partner Contribution"
                        min="0"
                        step="0.01"
                        value={partnerForm.contribution}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, contribution: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addPartner}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Partners List */}
                  {formData.partners.length > 0 && (
                    <div className="space-y-2">
                      {formData.partners.map((partner, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-gray-600">{partner.mobile}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₹{partner.contribution}</div>
                            <button
                              type="button"
                              onClick={() => removePartner(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMeel(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingMeel ? 'Update Meel Record' : 'Create Meel Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meel Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partners
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : meelRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No meel records found
                  </td>
                </tr>
              ) : (
                meelRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.cropName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.transactionType === 'Buy' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getTypeEmoji(record.transactionType)} {record.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.transactionMode === 'Individual' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {getModeEmoji(record.transactionMode)} {record.transactionMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.transactionMode === 'With Partner' && record.partners ? (
                        <div className="text-sm text-gray-900">
                          {record.partners.length} partner(s)
                          <div className="text-xs text-gray-500">
                            Total: ₹{record.partners.reduce((sum, p) => sum + p.contribution, 0)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{record.totalCost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {record.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meel; 