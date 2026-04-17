import { PrismaClient } from '@prisma/client';

const menus = [
  { name: 'Dashboard', icon: 'LayoutDashboard' },
  { name: 'Clients', icon: 'Users' },
  { name: 'Sales dashboard', icon: 'TrendingUp' },
  { name: 'Sales analytics', icon: 'BarChart3' },
  { name: 'Commission tracking', icon: 'Target' },
  { name: 'Lost orders analysis', icon: 'TrendingDown' },
  { name: 'Quotations', icon: 'FileEdit' },
  { name: 'Sales orders', icon: 'ShoppingCart' },
  { name: 'Dispatch planning', icon: 'Truck' },
  { name: 'Invoices & payments', icon: 'Receipt' },
  { name: 'Client credit', icon: 'CreditCard' },
  { name: 'Purchase order', icon: 'ShoppingBag' },
  { name: 'Product dashboard', icon: 'BarChart3' },
  { name: 'Product catalog', icon: 'Package' },
  { name: 'Product configuration', icon: 'Box' },
  { name: 'Bill of materials', icon: 'FileText' },
  { name: 'Work orders', icon: 'Factory' },
  { name: 'Operations dashboard', icon: 'Activity' },
  { name: 'Inventory management', icon: 'Warehouse' },
  { name: 'Stock ledger', icon: 'FileText' },
  { name: 'Material transactions', icon: 'ArrowRightLeft' },
  { name: 'Inventory', icon: 'Package' },
  { name: 'Planning', icon: 'Calendar' },
  { name: 'Hr dashboard', icon: 'UserCog' },
  { name: 'Employees', icon: 'UsersRound' },
  { name: 'Recruitment', icon: 'Briefcase' },
  { name: 'Attendance', icon: 'ClipboardCheck' },
  { name: 'Leave management', icon: 'CalendarDays' },
  { name: 'Payroll processing', icon: 'DollarSign' },
  { name: 'Salary structure', icon: 'Wallet' },
  { name: 'Statutory compliance', icon: 'Shield' },
  { name: 'Performance appraisal', icon: 'Award' },
  { name: 'Reports', icon: 'FileText' },
  { name: 'Workflows', icon: 'Workflow' },
  { name: 'Schema builder', icon: 'Database' },
  { name: 'Admin settings', icon: 'Settings' },
  { name: 'Shop', icon: 'Store' },
  { name: 'Service', icon: 'Briefcase' },
  { name: 'Appointment', icon: 'CalendarCheck' },
  { name: 'Customer', icon: 'Contact2' },
  { name: 'Wallet', icon: 'Wallet' },
  { name: 'Transaction', icon: 'Receipt' },
  { name: 'Whatsapp Chatbot', icon: 'Bot' },
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
