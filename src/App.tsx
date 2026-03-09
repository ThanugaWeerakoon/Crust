import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { db } from "../firebase";
import { collection, getDocs , addDoc } from "firebase/firestore";
import { useEffect } from "react";
// Pages
import { Dashboard } from './pages/Dashboard';
import { POSOrder } from './pages/POSOrder';
import MenuManagement from './pages/MenuManagement';
import { DiscountManagement } from './pages/DiscountManagement';
import { Reports } from './pages/Reports';
import { StaffManagement } from './pages/StaffManagement';
import { OrderHistory } from './pages/OrderHistory';

// Types
import { MenuItem, Order, Staff, Discount } from './types';

export function App() {
  const { isDark, toggleTheme } = useTheme();

  // App State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State (initialize as empty arrays)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

 const handlePlaceOrder = async (newOrder: Order) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), newOrder);

    const savedOrder = {
      ...newOrder,
      id: docRef.id
    };

    setOrders((prev) => [savedOrder, ...prev]);

  } catch (error) {
    console.error("Error saving order:", error);
  }
};

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
          />
        );

      case 'history':
        return <OrderHistory orders={orders} setOrders={setOrders} />;

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

      useEffect(() => {
        const loadMenuItems = async () => {
          try {
            const snapshot = await getDocs(collection(db, "menus"));

            const items: MenuItem[] = snapshot.docs.map((docSnap) => ({
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

      useEffect(() => {
  const loadOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));

      const loadedOrders: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">)
      }));

      setOrders(loadedOrders);

    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  loadOrders();
}, []);

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
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getPageTitle()}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
        <footer className="text-center text-xs py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500">
  <div className="flex flex-col items-center gap-1">
    <span className="font-semibold">
      Powered by LegionCode IT Solutions
    </span>
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