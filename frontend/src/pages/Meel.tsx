import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, TrendingUp, TrendingDown, DollarSign, Wheat, Users } from 'lucide-react';

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
  const [filteredRecords, setFilteredRecords] = useState<MeelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMeel, setEditingMeel] = useState<MeelRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    transactionType: '',
    transactionMode: '',
    tag: ''
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

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = meelRecords;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(record => 
        record.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.partners?.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply other filters
    if (filters.transactionType) {
      filtered = filtered.filter(record => record.transactionType === filters.transactionType);
    }
    if (filters.transactionMode) {
      filtered = filtered.filter(record => record.transactionMode === filters.transactionMode);
    }
    if (filters.tag) {
      filtered = filtered.filter(record => record.tag.toLowerCase().includes(filters.tag.toLowerCase()));
    }

    setFilteredRecords(filtered);
  }, [searchTerm, filters, meelRecords]);

  const fetchMeelRecords = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/meel?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMeelRecords(data.meelRecords);
        setFilteredRecords(data.meelRecords);
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

  // Calculate stats
  const totalBuyTransactions = meelRecords.filter(r => r.transactionType === 'Buy').length;
  const totalSellTransactions = meelRecords.filter(r => r.transactionType === 'Sell').length;
  const totalBuyAmount = meelRecords.filter(r => r.transactionType === 'Buy').reduce((sum, r) => sum + r.totalCost, 0);
  const totalSellAmount = meelRecords.filter(r => r.transactionType === 'Sell').reduce((sum, r) => sum + r.totalCost, 0);
  const totalProfit = totalSellAmount - totalBuyAmount;
  const totalPartnerTransactions = meelRecords.filter(r => r.transactionMode === 'With Partner').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading crop trading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-medium mb-4">Crop Trading Management</h1>
          <p className="text-xl text-orange-100 mb-6">
            Track crop trading with individual and partner collaborations
          </p>
          
        <button
          onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/30 transition-all duration-200"
        >
            <Plus className="h-5 w-5" />
            Add Trading Record
        </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-6">Trading Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Wheat className="h-6 w-6 text-orange-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Records</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">{meelRecords.length}</p>
            <p className="text-sm text-gray-600">All transactions</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-blue-600">{totalBuyTransactions} deals</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Purchases</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{totalBuyAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Crop investments</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600">{totalSellTransactions} deals</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{totalSellAmount.toLocaleString()}</p>
            <p className="text-sm text-green-600">Revenue generated</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className={`text-sm ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalBuyAmount > 0 ? Math.round(((totalProfit / totalBuyAmount) * 100)) : 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Net Profit</h3>
            <p className={`text-3xl font-medium mb-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{totalProfit.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Trading profit</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Partner Deals</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">{totalPartnerTransactions}</p>
            <p className="text-sm text-yellow-600">Collaborative trades</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop, tag, or partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Types</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          
            <select
              value={filters.transactionMode}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionMode: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Modes</option>
              <option value="Individual">Individual</option>
              <option value="With Partner">With Partner</option>
            </select>
          
            <input
              type="text"
              placeholder="Filter by tag..."
              value={filters.tag}
              onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing {filteredRecords.length} of {meelRecords.length} records
        </p>
      </div>

      {/* Trading Records */}
                <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium text-gray-900">Trading Records ({filteredRecords.length})</h2>
          <div className="text-sm text-gray-500">
            Total trades: {meelRecords.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partners</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                          <span className="text-orange-600 font-medium text-sm">
                            {record.cropName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.cropName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                        record.transactionType === 'Buy' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getTypeEmoji(record.transactionType)} {record.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
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
                          <div className="font-medium">{record.partners.length} partner(s)</div>
                          <div className="text-xs text-gray-500">
                            Total: ₹{record.partners.reduce((sum, p) => sum + p.contribution, 0).toLocaleString()}
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
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {record.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

            {meelRecords.length === 0 && (
              <div className="text-center py-12">
                <Wheat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No trading records yet</p>
                <p className="text-gray-400 text-sm mb-4">Start by adding your first crop trading record</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </button>
              </div>
            )}
          </div>
        </div>
        </div>

      {/* Trading Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border-0 w-[700px] shadow-2xl rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {editingMeel ? 'Edit Trading Record' : 'Add New Trading Record'}
                </h3>
              <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMeel(null);
                    resetForm();
                  }}
                  className="text-white hover:text-orange-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.cropName}
                        onChange={(e) => setFormData(prev => ({ ...prev, cropName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Wheat, Rice, Cotton"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
                      <select
                        required
                        value={formData.transactionType}
                        onChange={(e) => setFormData(prev => ({ ...prev, transactionType: e.target.value as 'Buy' | 'Sell' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Buy">🛒 Buy</option>
                        <option value="Sell">💰 Sell</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Mode *</label>
                      <select
                        required
                        value={formData.transactionMode}
                        onChange={(e) => setFormData(prev => ({ ...prev, transactionMode: e.target.value as 'Individual' | 'With Partner' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Individual">👤 Individual</option>
                        <option value="With Partner">👥 With Partner</option>
                      </select>
                    </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.totalCost}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalCost: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag *</label>
                    <input
                      type="text"
                      required
                      value={formData.tag}
                      onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Seasonal, Bulk, Premium"
                    />
                  </div>
                </div>

                {/* Partner Section */}
                {formData.transactionMode === 'With Partner' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">👥 Partners</h4>
                    
                    {/* Add Partner Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Partner Name"
                        value={partnerForm.name}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Partner Mobile No."
                        value={partnerForm.mobile}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, mobile: e.target.value }))}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Contribution"
                          min="0"
                          step="0.01"
                          value={partnerForm.contribution}
                          onChange={(e) => setPartnerForm(prev => ({ ...prev, contribution: e.target.value }))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={addPartner}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-all duration-200"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Partners List */}
                    {formData.partners.length > 0 && (
                      <div className="space-y-2">
                        {formData.partners.map((partner, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                            <div className="flex-1">
                              <div className="font-medium">{partner.name}</div>
                              <div className="text-sm text-gray-600">{partner.mobile}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₹{partner.contribution.toLocaleString()}</div>
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
                        <div className="text-sm text-gray-600 mt-2">
                          Total Partner Contribution: ₹{formData.partners.reduce((sum, p) => sum + p.contribution, 0).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {editingMeel ? '🔄 Update Record' : '📝 Create Record'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMeel(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Meel; 