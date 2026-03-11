import { MenuItem, Order, Staff, Discount } from '../types';

export const mockMenuItems: MenuItem[] = [
{
  id: 'm1',
  name: 'Margherita Pizza',
  price: 1500,
  category: 'Pizza',
  description: 'Classic tomato and mozzarella',
  available: true
},
{
  id: 'm2',
  name: 'Pepperoni Pizza',
  price: 2200,
  category: 'Pizza',
  description: 'Spicy pepperoni with extra cheese',
  available: true
},
{
  id: 'm3',
  name: 'BBQ Chicken Pizza',
  price: 2500,
  category: 'Pizza',
  description: 'Grilled chicken, BBQ sauce, onions',
  available: true
},
{
  id: 'm4',
  name: 'Vegetarian Supreme',
  price: 1800,
  category: 'Pizza',
  description: 'Bell peppers, mushrooms, olives, onions',
  available: true
},
{
  id: 'm5',
  name: 'Classic Beef Burger',
  price: 1200,
  category: 'Burgers',
  description: '100% beef patty with lettuce and tomato',
  available: true
},
{
  id: 'm6',
  name: 'Crispy Chicken Burger',
  price: 1100,
  category: 'Burgers',
  description: 'Fried chicken breast with mayo',
  available: true
},
{
  id: 'm7',
  name: 'Double Cheese Burger',
  price: 1600,
  category: 'Burgers',
  description: 'Two beef patties with double cheese',
  available: true
},
{
  id: 'm8',
  name: 'Spaghetti Carbonara',
  price: 1800,
  category: 'Pasta',
  description: 'Creamy sauce with bacon and parmesan',
  available: true
},
{
  id: 'm9',
  name: 'Penne Arrabbiata',
  price: 1400,
  category: 'Pasta',
  description: 'Spicy tomato sauce with garlic',
  available: true
},
{
  id: 'm10',
  name: 'Seafood Marinara',
  price: 2400,
  category: 'Pasta',
  description: 'Mixed seafood in rich tomato sauce',
  available: false
},
{
  id: 'm11',
  name: 'Coca Cola',
  price: 300,
  category: 'Drinks',
  description: 'Chilled 500ml',
  available: true
},
{
  id: 'm12',
  name: 'Fresh Orange Juice',
  price: 600,
  category: 'Drinks',
  description: 'Freshly squeezed',
  available: true
},
{
  id: 'm13',
  name: 'Iced Latte',
  price: 750,
  category: 'Drinks',
  description: 'Espresso with cold milk and ice',
  available: true
},
{
  id: 'm14',
  name: 'Chocolate Milkshake',
  price: 900,
  category: 'Drinks',
  description: 'Thick chocolate shake with cream',
  available: true
},
{
  id: 'm15',
  name: 'Tiramisu',
  price: 1200,
  category: 'Desserts',
  description: 'Classic Italian coffee dessert',
  available: true
},
{
  id: 'm16',
  name: 'Cheesecake',
  price: 1100,
  category: 'Desserts',
  description: 'New York style with berry compote',
  available: true
},
{
  id: 'm17',
  name: 'Chocolate Lava Cake',
  price: 1300,
  category: 'Desserts',
  description: 'Warm cake with molten center',
  available: true
}];


export const mockStaff: Staff[] = [
{
  id: 's1',
  name: 'Chamod',
  role: 'Admin',
  email: 'kamal@crust.com',
  phone: '0771234567',
  status: 'Active'
},
{
  id: 's2',
  name: 'Nimali Silva',
  role: 'Manager',
  email: 'nimali@crust.com',
  phone: '0719876543',
  status: 'Active'
},
];


export const mockDiscounts: Discount[] = [
{
  id: 'd1',
  name: 'Student Discount',
  type: 'percentage',
  value: 10,
  appliesTo: 'order',
  validFrom: '2023-01-01',
  validTo: '2025-12-31',
  enabled: true
},
{
  id: 'd2',
  name: 'Happy Hour',
  type: 'percentage',
  value: 20,
  appliesTo: 'order',
  validFrom: '2023-01-01',
  validTo: '2025-12-31',
  enabled: true
},
{
  id: 'd3',
  name: 'LKR 500 Off Promo',
  type: 'fixed',
  value: 500,
  appliesTo: 'order',
  validFrom: '2023-10-01',
  validTo: '2024-12-31',
  enabled: true
}];


const generateMockOrders = (): Order[] => {
  const orders: Order[] = [];
  const statuses: ('Completed' | 'Refunded')[] = [
  'Completed',
  'Completed',
  'Completed',
  'Completed',
  'Refunded'];

  const methods: ('Cash' | 'Card' | 'Online')[] = [
  'Cash',
  'Card',
  'Card',
  'Online'];


  for (let i = 1; i <= 20; i++) {
    const isTakeaway = Math.random() > 0.5;
    const itemsCount = Math.floor(Math.random() * 4) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemsCount; j++) {
      const menuItem =
      mockMenuItems[Math.floor(Math.random() * mockMenuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({ ...menuItem, quantity });
      subtotal += menuItem.price * quantity;
    }

    const tax = subtotal * 0.1;
    const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discount;

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Last 7 days
    date.setHours(Math.floor(Math.random() * 10) + 10); // 10 AM to 8 PM

    orders.push({
      id: `ORD-${1000 + i}`,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      tableNumber: isTakeaway ?
      undefined :
      `T${Math.floor(Math.random() * 15) + 1}`,
      isTakeaway,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: date.toISOString(),
      cashier: mockStaff[Math.floor(Math.random() * mockStaff.length)].name
    });
  }

  return orders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const mockOrders = generateMockOrders();