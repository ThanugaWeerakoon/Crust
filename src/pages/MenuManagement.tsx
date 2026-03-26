import { db } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useState } from "react";
import { MenuItem, Category } from "../types";
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, XIcon } from "lucide-react";

interface MenuManagementProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

interface MenuForm {
  name: string;
  description: string;
  price: string;
  category: Category;
  available: boolean;
}

const emptyForm: MenuForm = {
  name: "",
  description: "",
  price: "",
  category: "Mocktails",
  available: true
};

export default function MenuManagement({
  menuItems,
  setMenuItems
}: MenuManagementProps) {

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);

  const categories: (Category | "All")[] = [
    "All",
    "Mocktails",
    "Smoothies",
    "Milkshake",
    "Juice",
    "Soft Drinks",
    "The Classics",
    "Wines",
    "Beer",
    "Pizza",
    "Add Ons",
    "Tacos",
    "From the Grill",
    "To Share",
    "Salads",
    "Sweets"
  ];


  const filteredItems = menuItems.filter((item: MenuItem) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (amount: number) =>
    `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

  const toggleAvailability = async (id: string) => {
    const item = menuItems.find((i: MenuItem) => i.id === id);
    if (!item) return;

    const updatedStatus = !item.available;

    try {
      await updateDoc(doc(db, "menus", id), { available: updatedStatus });

      setMenuItems((prev: MenuItem[]) =>
        prev.map((i: MenuItem) =>
          i.id === id ? { ...i, available: updatedStatus } : i
        )
      );

    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteDoc(doc(db, "menus", id));

      setMenuItems((prev: MenuItem[]) =>
        prev.filter((item: MenuItem) => item.id !== id)
      );

    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available
    });

    setIsModalOpen(true);
  };

  const handleSave = async () => {
  if (!form.name.trim() || !form.price) return;

  const itemData: Omit<MenuItem, 'id'> = {
    name: form.name.trim(),
    description: form.description.trim(),
    price: parseFloat(form.price) || 0, // convert string to number
    category: form.category,
    available: form.available
  };

  try {
 if (editingId) {
  await updateDoc(doc(db, "menus", editingId), itemData);

  setMenuItems(prev =>
    prev.map(item => item.id === editingId ? { ...item, ...itemData } : item)
  );
} else {
  const docRef = await addDoc(collection(db, "menus"), itemData);
  const newItem: MenuItem = { id: docRef.id, ...itemData };
  setMenuItems(prev => [...prev, newItem]);
} 

    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);

  } catch (error) {
    console.error("Error saving item:", error);
  }
};

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

  

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 rounded-lg"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item: MenuItem) => (
              <tr key={item.id}>
                <td className="text-center">{item.name}</td>
                <td className="text-center">{item.category}</td>
                <td className="text-center">{formatCurrency(item.price)}</td>

                <td className="text-center">
                  <button onClick={() => toggleAvailability(item.id)}>
                    {item.available ? "Available" : "Out of Stock"}
                  </button>
                </td>

                <td className="p-4  text-center space-x-2">
                  <button onClick={() => openEditModal(item)}>
                    <EditIcon size={16} />
                  </button>

                  <button onClick={() => deleteItem(item.id)}>
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>


      {isModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        <button onClick={() => setIsModalOpen(false)}>
          <XIcon size={20} />
        </button>
      </div>

      {/* Name */}
      <input
        type="text"
        placeholder="Item name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border rounded-lg p-2 dark:bg-slate-900"
      />

      {/* Description */}
      <input
        type="text"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border rounded-lg p-2 dark:bg-slate-900"
      />

      {/* Price */}
      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="w-full border rounded-lg p-2 dark:bg-slate-900"
      />

      {/* Category */}
      <select
        value={form.category}
        onChange={(e) =>
          setForm({ ...form, category: e.target.value as Category })
        }
        className="w-full border rounded-lg p-2 dark:bg-slate-900"
      >
        {categories
          .filter((c) => c !== "All")
          .map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
      </select>

      {/* Available */}
          <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Availability</span>

        <button
          type="button"
          onClick={() => setForm({ ...form, available: !form.available })}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
            form.available ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              form.available ? "translate-x-9" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>

    
  );
}