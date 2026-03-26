import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc ,doc } from "firebase/firestore";

// Pages
import { Dashboard } from './pages/Dashboard';
import { POSOrder } from './pages/POSOrder';
import MenuManagement from './pages/MenuManagement';
import { DiscountManagement } from './pages/DiscountManagement';
import { Reports } from './pages/Reports';
import { StaffManagement } from './pages/StaffManagement';
import { OrderHistory } from './pages/OrderHistory';


// Hooks
import { useTheme } from './hooks/useTheme';

// Types
import { MenuItem, Order, Staff, Discount } from './types';

export function App() {
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);


  // App State
  const [currentPage, setCurrentPage] = useState('pos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [activeCategory, setActiveCategory] = useState("Add Ons");
  

  // -------------------------------
  // Firestore: Load Menu Items
  // -------------------------------
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menus"));
        const items: MenuItem[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MenuItem, "id">)
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error loading menu items:", error);
      }
    };
    loadMenuItems();
  }, []);

  // -------------------------------
  // Firestore: Load Orders
  // -------------------------------
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const loadedOrders: Order[] = snapshot.docs.map(doc => ({
          firestoreId: doc.id,
          id: doc.data().id || doc.id,
          ...(doc.data() as Omit<Order, "id" | "firestoreId">)
        }));
        setOrders(loadedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };
    loadOrders();
  }, []);

  // -------------------------------
  // Place or Edit Order Handler
  // -------------------------------
  const handlePlaceOrder = async (newOrder: Omit<Order, "firestoreId">, existingFirestoreId?: string) => {
    try {
      if (existingFirestoreId) {
        // Updating existing order
        await updateDoc(doc(db, "orders", existingFirestoreId),
          newOrder
        );

        setOrders(prev =>
          prev.map(o =>
            o.firestoreId === existingFirestoreId ? { ...o, ...newOrder } : o
          )
        );
        setEditingOrder(null);
      } else {
        // Adding new order
        const docRef = await addDoc(collection(db, "orders"), newOrder);
        setOrders(prev => [{ ...newOrder, firestoreId: docRef.id }, ...prev]);
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  // -------------------------------
  // Edit Order from OrderHistory
  // -------------------------------
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setCurrentPage('pos'); // Navigate to POSOrder
  };

  // -------------------------------
  // Page Rendering
  // -------------------------------
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'pos':
        return (
          <POSOrder
            menuItems={menuItems}
            discounts={discounts}
            onPlaceOrder={handlePlaceOrder}
            editingOrder={editingOrder}
             activeCategory={activeCategory}
          />
        );
      case 'history':
        return (
          <OrderHistory
            orders={orders}
            setOrders={setOrders}
            onEditOrder={handleEditOrder}
          />
        );
      case 'menu':
        return <MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} />;
      case 'discounts':
        return <DiscountManagement discounts={discounts} setDiscounts={setDiscounts} />;
      case 'reports':
        return <Reports orders={orders} />;
      case 'staff':
        return <StaffManagement staff={staff} setStaff={setStaff} />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      pos: 'New Order',
      history: 'Order History',
      menu: 'Menu Management',
      discounts: 'Discounts',
      reports: 'Reports & Analytics',
      staff: 'Staff Management',
    };
    return titles[currentPage] || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
     <Sidebar
  activeCategory={activeCategory}
  setActiveCategory={setActiveCategory}
/>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
   <Header
        title="Dashboard"
        currentPage={currentPage}
        setCurrentPage={setCurrentPage} // ✅ THIS IS CRITICAL
        onMenuClick={() => setIsMobileOpen(true)}
      />
    

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>

        {/* Footer */}
        <footer className="text-center text-xs py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500">
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold">Powered by LegionCode IT Solutions</span>
            <a
              href="https://www.legioncodeitsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              www.legioncodeitsolutions.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}