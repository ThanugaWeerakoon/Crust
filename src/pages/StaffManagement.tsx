import React, { useState } from 'react';
import { Staff } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, XIcon } from 'lucide-react';
interface StaffManagementProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}
const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'Cashier' as Staff['role'],
  status: 'Active' as Staff['status']
};
export function StaffManagement({ staff, setStaff }: StaffManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const filteredStaff = staff.filter(
    (s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const toggleStatus = (id: string) => {
    setStaff((prev) =>
    prev.map((s) =>
    s.id === id ?
    {
      ...s,
      status: s.status === 'Active' ? 'Inactive' : 'Active'
    } :
    s
    )
    );
  };
  const deleteStaff = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    }
  };
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };
  const openEditModal = (member: Staff) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      status: member.status
    });
    setIsModalOpen(true);
  };
  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editingId) {
      setStaff((prev) =>
      prev.map((s) =>
      s.id === editingId ?
      {
        ...s,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        status: form.status
      } :
      s
      )
      );
    } else {
      const newStaff: Staff = {
        id: `s${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        status: form.status
      };
      setStaff((prev) => [...prev, newStaff]);
    }
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />

        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]">

          <PlusIcon className="h-5 w-5" />
          Add Staff
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredStaff.map((member) =>
              <tr
                key={member.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                        {member.name.
                      split(' ').
                      map((n) => n[0]).
                      join('')}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {member.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                      ${member.role === 'Admin' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400' : member.role === 'Cashier' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>

                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900 dark:text-white">
                      {member.email}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {member.phone}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                    onClick={() => toggleStatus(member.id)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px]
                        ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-400 hover:bg-gray-200'}`}>

                      {member.status}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                    onClick={() => openEditModal(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">

                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                    onClick={() => deleteStaff(member.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">

                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen &&
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Staff Member' : 'Add New Staff'}
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
                  Full Name
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
                placeholder="e.g. Kamal Perera"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                type="email"
                value={form.email}
                onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
                }
                placeholder="e.g. kamal@crust.com"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value
                  })
                  }
                  placeholder="e.g. 0771234567"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />

                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                  value={form.role}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as Staff['role']
                  })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">

                    <option value="Admin">Admin</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Biller">Biller</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.status === 'Active'}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.checked ? 'Active' : 'Inactive'
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

                {editingId ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}