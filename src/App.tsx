import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// Pages
import { Dashboard } from './pages/Dashboard';
import { POSOrder } from './pages/POSOrder';
import MenuManagement from './pages/MenuManagement';
import { DiscountManagement } from './pages/DiscountManagement';
import { Reports } from './pages/Reports';
import { StaffManagement } from './pages/StaffManagement';
import { OrderHistory } from './pages/OrderHistory';
import { Login } from './pages/Login';



// Hooks
import { useTheme } from './hooks/useTheme';

// Types
import { MenuItem, Order, Staff, Discount } from './types';

export function App() {
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Staff['role'] | null>(null);
  const [authLoading, setAuthLoading] = useState(true);


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
  // Firebase: Auth State Listener
  // -------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const q = query(collection(db, "staff"), where("email", "==", currentUser.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const staffData = snapshot.docs[0].data() as Staff;
            setUserRole(staffData.role);
            setUserName(staffData.name);
            
            // Redirect based on role if current page is restricted
            if (staffData.role === 'Biller') {
              setCurrentPage('history');
            } else if (staffData.role === 'Cashier' && (currentPage === 'dashboard' || currentPage === 'reports' || currentPage === 'staff' || currentPage === 'menu' || currentPage === 'discounts')) {
              // Cashiers can see everything except dashboard (Wait, user said "everything except dashboard" - usually that means POS, History, etc. But for a POS system, Cashier usually doesn't manage menu/staff either.)
              // I'll stick to the user's specific instruction: "cashier role can see everything except the dashboard"
              if (currentPage === 'dashboard') setCurrentPage('pos');
            }
          } else {
            // Hardcoded fallbacks for the provided test accounts
            const email = currentUser.email;
            if (email === 'crust@gmail.com') {
              setUserRole('Admin');
              setUserName('Admin');
            } else if (email === 'crustcashier@gmail.com') {
              setUserRole('Cashier');
              setUserName('Cashier');
              if (currentPage === 'dashboard') setCurrentPage('pos');
            } else if (email === 'crustbiller@gmail.com') {
              setUserRole('Biller');
              setUserName('Biller');
              setCurrentPage('history');
            } else {
              // Default role if not found in staff collection (e.g. first user)
              setUserRole('Admin');
              setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin');
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('Biller'); // Fallback
        }
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // -------------------------------
  // Firestore: Load Menu Items
  // -------------------------------
  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  // -------------------------------
  // Firestore: Load Orders
  // -------------------------------
  useEffect(() => {
    if (!user) return;
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
  }, [user]);

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
    // Role-based restrictions
    if (userRole === 'Biller' && currentPage !== 'history') {
      return <OrderHistory orders={orders} setOrders={setOrders} onEditOrder={handleEditOrder} />;
    }
    if (userRole === 'Cashier' && currentPage === 'dashboard') {
       return (
          <POSOrder
            menuItems={menuItems}
            discounts={discounts}
            onPlaceOrder={handlePlaceOrder}
            editingOrder={editingOrder}
             activeCategory={activeCategory}
          />
        );
    }

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

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading HotepPOS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        userName={userName}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={getPageTitle()}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onMenuClick={() => setIsMobileOpen(true)}
          userRole={userRole}
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