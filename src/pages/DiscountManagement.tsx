import  { useState } from 'react';
import { Discount } from '../types';
import { PlusIcon, EditIcon, TrashIcon, TagIcon, XIcon } from 'lucide-react';
interface DiscountManagementProps {
  discounts: Discount[];
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
}
const emptyForm = {
  name: '',
  type: 'percentage' as Discount['type'],
  value: '',
  appliesTo: 'order' as Discount['appliesTo'],
  validFrom: '',
  validTo: '',
  enabled: true
};
export function DiscountManagement({
  discounts,
  setDiscounts
}: DiscountManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const toggleDiscount = (id: string) => {
    setDiscounts((prev) =>
    prev.map((d) =>
    d.id === id ?
    {
      ...d,
      enabled: !d.enabled
    } :
    d
    )
    );
  };
  const deleteDiscount = (id: string) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    }
  };
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };
  const openEditModal = (discount: Discount) => {
    setEditingId(discount.id);
    setForm({
      name: discount.name,
      type: discount.type,
      value: discount.value.toString(),
      appliesTo: discount.appliesTo,
      validFrom: discount.validFrom,
      validTo: discount.validTo,
      enabled: discount.enabled
    });
    setIsModalOpen(true);
  };
  const handleSave = () => {
    if (!form.name.trim() || !form.value) return;
    if (editingId) {
      setDiscounts((prev) =>
      prev.map((d) =>
      d.id === editingId ?
      {
        ...d,
        name: form.name.trim(),
        type: form.type,
        value: parseFloat(form.value) || 0,
        appliesTo: form.appliesTo,
        validFrom: form.validFrom,
        validTo: form.validTo,
        enabled: form.enabled
      } :
      d
      )
      );
    } else {
      const newDiscount: Discount = {
        id: `d${Date.now()}`,
        name: form.name.trim(),
        type: form.type,
        value: parseFloat(form.value) || 0,
        appliesTo: form.appliesTo,
        validFrom: form.validFrom,
        validTo: form.validTo,
        enabled: form.enabled
      };
      setDiscounts((prev) => [...prev, newDiscount]);
    }
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Active Discounts & Promotions
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]">

          <PlusIcon className="h-5 w-5" />
          Create Discount
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discounts.map((discount) =>
        <div
          key={discount.id}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center">
                  <TagIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {discount.name}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {discount.appliesTo === 'order' ?
                  'Entire Order' :
                  'Specific Items'}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                className="sr-only peer"
                checked={discount.enabled}
                onChange={() => toggleDiscount(discount.id)} />

                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Value:
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-lg">
                  {discount.type === 'percentage' ?
                `${discount.value}% OFF` :
                `LKR ${discount.value} OFF`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Valid From:
                </span>
                <span className="text-slate-900 dark:text-white">
                  {discount.validFrom}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Valid To:
                </span>
                <span className="text-slate-900 dark:text-white">
                  {discount.validTo}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
              onClick={() => openEditModal(discount)}
              className="flex-1 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]">

                <EditIcon className="h-4 w-4" /> Edit
              </button>
              <button
              onClick={() => deleteDiscount(discount.id)}
              className="flex-1 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]">

                <TrashIcon className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen &&
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Discount' : 'Create New Discount'}
              </h2>
              <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">

                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Discount Name
                </label>
                <input
                type="text"
                value={form.name}
                onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
                }
                placeholder="e.g. Student Discount"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                  value={form.type}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as Discount['type']
                  })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">

                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (LKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Value {form.type === 'percentage' ? '(%)' : '(LKR)'}
                  </label>
                  <input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    value: e.target.value
                  })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Applies To
                </label>
                <select
                value={form.appliesTo}
                onChange={(e) =>
                setForm({
                  ...form,
                  appliesTo: e.target.value as Discount['appliesTo']
                })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">

                  <option value="order">Entire Order</option>
                  <option value="item">Specific Items</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valid From
                  </label>
                  <input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    validFrom: e.target.value
                  })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valid To
                  </label>
                  <input
                  type="date"
                  value={form.validTo}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    validTo: e.target.value
                  })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enabled
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.enabled}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    enabled: e.target.checked
                  })
                  } />

                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]">

                Cancel
              </button>
              <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-lg font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors min-h-[44px]">

                {editingId ? 'Save Changes' : 'Create Discount'}
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}