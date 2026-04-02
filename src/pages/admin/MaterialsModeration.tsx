import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { supabaseUntyped as supabase } from '@/lib/supabase';
import { Search, Edit, Trash2, Plus, CheckCircle } from '@/lib/icons';

interface Material {
  id: string;
  name: string;
  category: string;
  sector: string;
  unit: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export default function MaterialsModeration() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sector: '',
    unit: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, sectorFilter, materials]);

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast('error', 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    if (sectorFilter !== 'all') {
      filtered = filtered.filter(m => m.sector === sectorFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  };

  const openEditModal = (material?: Material) => {
    if (material) {
      setSelectedMaterial(material);
      setFormData({
        name: material.name,
        category: material.category,
        sector: material.sector,
        unit: material.unit,
        description: material.description || '',
        is_active: material.is_active
      });
    } else {
      setSelectedMaterial(null);
      setFormData({
        name: '',
        category: '',
        sector: 'construction',
        unit: '',
        description: '',
        is_active: true
      });
    }
    setShowEditModal(true);
  };

  const saveMaterial = async () => {
    try {
      if (selectedMaterial) {
        const { error } = await supabase
          .from('materials')
          .update(formData)
          .eq('id', selectedMaterial.id);

        if (error) throw error;
        toast('success', 'Material updated successfully');
      } else {
        const { error } = await supabase
          .from('materials')
          .insert([formData]);

        if (error) throw error;
        toast('success', 'Material created successfully');
      }

      setShowEditModal(false);
      loadMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      toast('error', 'Failed to save material');
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast('success', 'Material deleted');
      loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast('error', 'Failed to delete material');
    }
  };

  const sectors = ['construction', 'agriculture', 'manufacturing', 'energy', 'technology'];

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materials Management</h1>
            <p className="text-gray-600 mt-2">Manage materials catalog</p>
          </div>
          <Button onClick={() => openEditModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector} className="capitalize">
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{material.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{material.sector}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.unit}</td>
                    <td className="px-6 py-4">
                      {material.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge>Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(material)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMaterial(material.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No materials found</p>
            </div>
          )}
        </Card>

        {showEditModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowEditModal(false)}
            title={selectedMaterial ? 'Edit Material' : 'Add Material'}
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., building_materials"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector} className="capitalize">
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., bag, kg, ton"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={saveMaterial} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {selectedMaterial ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
