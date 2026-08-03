import { PrismaClient } from '@prisma/client';

const menus = [
  { name: 'Dashboard', icon: 'LayoutDashboard' },
  // Sales
  { name: 'Clients', icon: 'Users' },
  { name: 'Sales Dashboard', icon: 'TrendingUp' },
  { name: 'Sales Analytics', icon: 'BarChart3' },
  { name: 'Commission Tracking', icon: 'Target' },
  { name: 'Lost Orders Analysis', icon: 'TrendingDown' },
  { name: 'Quotations', icon: 'FileEdit' },
  { name: 'Sales Orders', icon: 'ShoppingCart' },
  { name: 'Dispatch Planning', icon: 'Truck' },
  { name: 'Invoices & Payments', icon: 'Receipt' },
  { name: 'Client Credit', icon: 'CreditCard' },
  // Purchase
  // { name: 'Purchase Order', icon: 'ShoppingBag' },
  // Products & Production
  // { name: 'Product Dashboard', icon: 'BarChart3' },
  // { name: 'Product Configuration', icon: 'Box' },
  // { name: 'Bill of Materials', icon: 'FileText' },
  // { name: 'Work Orders', icon: 'Factory' },
  // Operations
  { name: 'Operations Dashboard', icon: 'Activity' },
  { name: 'Product Catalog', icon: 'Package' },
  { name: 'Inventory Management', icon: 'Warehouse' },
  // { name: 'Stock Ledger', icon: 'FileText' },
  // { name: 'Material Transactions', icon: 'ArrowRightLeft' },
  // { name: 'Inventory', icon: 'Package' },
  // { name: 'Planning', icon: 'Calendar' },
  // HR & Payroll
  { name: 'HR Dashboard', icon: 'UserCog' },
  { name: 'Employees', icon: 'UsersRound' },
  { name: 'Recruitment', icon: 'Briefcase' },
  { name: 'Attendance', icon: 'ClipboardCheck' },
  { name: 'Leave Management', icon: 'CalendarDays' },
  { name: 'Payroll Processing', icon: 'IndianRupee' },
  { name: 'Salary Structure', icon: 'Wallet' },
  { name: 'Statutory Compliance', icon: 'Shield' },
  { name: 'Performance Appraisal', icon: 'Award' },
  // Reports
  // { name: 'Reports', icon: 'FileText' },
  // Configuration
  // { name: 'Workflows', icon: 'Workflow' },
  // { name: 'Schema Builder', icon: 'Database' },
  { name: 'Admin Settings', icon: 'Settings' },
  // Business
  { name: 'Business Dashboard', icon: 'LayoutDashboard' },
  { name: 'Shop', icon: 'Store' },
  { name: 'Service', icon: 'Briefcase' },
  { name: 'Offers', icon: 'Gift' },
  { name: 'Appointment', icon: 'CalendarCheck' },
  { name: 'Customer', icon: 'Contact2' },
  { name: 'Transaction', icon: 'ReceiptIndianRupee' },
  { name: 'Expense', icon: 'CreditCard' },
  { name: 'Wallet', icon: 'Wallet' },
  { name: 'Staff & Partners', icon: 'UserCog' },
  { name: 'Whatsapp Chatbot', icon: 'Bot' },
  { name: 'Business Pos', icon: 'MonitorSmartphone' },
  { name: 'Service Packages', icon: 'Package' },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function seedMenus(prisma: PrismaClient) {
  try {
    for (const menu of menus) {
      await prisma.menu.upsert({
        where: { name: menu.name },
        update: {
          name: menu.name,
          icon: menu.icon,
        },
        create: {
          name: menu.name,
          icon: menu.icon,
        },
      });

      await delay(1000);
    }

    console.log('Menus seeded successfully.');
  } catch (error) {
    console.error('Error seeding menus:', error);
  }
}
