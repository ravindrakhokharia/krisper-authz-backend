import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { HelperServices } from '../shared/helper/helper.services';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperServices,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const capitalize = this.helperService.capitalize.bind(this.helperService);
    const existMenu = await this.prisma.menu.findUnique({
      where: {
        name: capitalize(createMenuDto.name),
      },
    });

    if (existMenu) {
      return existMenu;
    }

    const menu = await this.prisma.menu.create({
      data: {
        name: capitalize(createMenuDto.name),
        icon: createMenuDto.icon,
      },
    });
    return { data: menu, message: 'Menu created successfully' };
  }

  async findAll() {
    const menus = await this.prisma.menu.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return { data: menus, message: 'Menus fetched successfully' };
  }

  async findHierarchical() {
    const menus = await this.prisma.menu.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Define the hierarchy structure mapping matching the frontend design
    // Each matchItem has { name, path } to include route paths in the response
    const hierarchyDefinition = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: 'Home',
        path: 'dashboard',
        type: 'standalone' as const,
        matchItems: [{ name: 'dashboard', path: 'dashboard' }],
      },
      {
        id: 'client',
        name: 'Clients',
        icon: 'Users',
        path: 'client',
        type: 'standalone' as const,
        matchItems: [{ name: 'clients', path: 'client' }],
      },
      {
        id: 'sales',
        name: 'Sales',
        icon: 'TrendingUp',
        path: 'sales',
        type: 'group' as const,
        matchItems: [
          { name: 'sales dashboard', path: 'sales/sales-dashboard' },
          { name: 'sales analytics', path: 'sales/sales-analytics' },
          { name: 'commission tracking', path: 'sales/commission' },
          { name: 'lost orders analysis', path: 'sales/lost-orders-analysis' },
          { name: 'quotations', path: 'sales/quotations' },
          { name: 'sales orders', path: 'sales/sales-order' },
          { name: 'dispatch planning', path: 'sales/dispatch-planning' },
          { name: 'invoices & payments', path: 'sales/invoices-payments' },
          { name: 'client credit', path: 'credit-credit' },
        ],
      },
      // {
      //   id: 'purchase',
      //   name: 'Purchase',
      //   icon: 'ShoppingBag',
      //   path: 'purchase',
      //   type: 'group' as const,
      //   matchItems: [
      //     { name: 'purchase order', path: 'purchase/purchase-orders' },
      //   ],
      // },
      // {
      //   id: 'products-production',
      //   name: 'Products & Production',
      //   icon: 'Factory',
      //   path: 'products-production',
      //   type: 'group' as const,
      //   matchItems: [
      //     { name: 'product dashboard', path: 'products/product-dashboard' },
      //     { name: 'product catalog', path: 'products/product-catalog' },
      //     {
      //       name: 'product configuration',
      //       path: 'products/product-configuration',
      //     },
      //     { name: 'bill of materials', path: 'products/bill-of-materials' },
      //     { name: 'work orders', path: 'products/work-orders' },
      //   ],
      // },
      {
        id: 'operations',
        name: 'Operations',
        icon: 'Activity',
        path: 'operations',
        type: 'group' as const,
        matchItems: [
          {
            name: 'operations dashboard',
            path: 'operations/operations-dashboard',
          },
          { name: 'product catalog', path: 'operations/product-catalog' },
          {
            name: 'inventory management',
            path: 'operations/inventory-management',
          },
          // { name: 'stock ledger', path: 'operations/stock-ledger' },
          // {
          //   name: 'material transactions',
          //   path: 'operations/material-transactions',
          // },
          // { name: 'inventory', path: 'operations/inventory' },
          // { name: 'planning', path: 'operations/planning' },
        ],
      },
      {
        id: 'business',
        name: 'Business',
        icon: 'Building2',
        path: 'business',
        type: 'group' as const,
        matchItems: [
          { name: 'business dashboard', path: 'business/dashboard' },
          { name: 'shop', path: 'business/shop' },
          { name: 'service', path: 'business/service' },
          { name: 'offers', path: 'business/offers' },
          { name: 'appointment', path: 'business/appointment' },
          { name: 'customer', path: 'business/customer' },
          { name: 'transaction', path: 'business/transaction' },
          { name: 'expense', path: 'business/expense' },
          { name: 'wallet', path: 'business/wallet' },
          { name: 'staff & partners', path: 'business/staff-and-partners' },
          { name: 'whatsapp chatbot', path: 'business/whatsapp-chatbot' },
          { name: 'business pos', path: 'pos' },
        ],
      },
      {
        id: 'hr-payroll',
        name: 'HR & Payroll',
        icon: 'UserCog',
        path: 'hr-payroll',
        type: 'group' as const,
        matchItems: [
          { name: 'hr dashboard', path: 'hr/hr-dashboard' },
          { name: 'employees', path: 'hr/employees' },
          { name: 'recruitment', path: 'hr/recruitment' },
          { name: 'attendance', path: 'hr/attendance' },
          { name: 'leave management', path: 'hr/leave-management' },
          { name: 'payroll processing', path: 'hr/payroll-processing' },
          { name: 'salary structure', path: 'hr/salary-structure' },
          {
            name: 'statutory compliance',
            path: 'hr/statutory-compliance',
          },
          {
            name: 'performance appraisal',
            path: 'hr/performance-appraisal',
          },
        ],
      },
      // {
      //   id: 'reports',
      //   name: 'Reports',
      //   icon: 'FileText',
      //   path: 'reports',
      //   type: 'standalone' as const,
      //   matchItems: [{ name: 'reports', path: 'reports' }],
      // },
      {
        id: 'configuration',
        name: 'Configuration',
        icon: 'Cog',
        path: 'configuration',
        type: 'group' as const,
        matchItems: [
          // { name: 'workflows', path: 'configuration/workflows' },
          // { name: 'schema builder', path: 'configuration/schema-builder' },
          { name: 'admin settings', path: 'configuration/admin-settings' },
        ],
      },
    ];

    // Build the nested result structure
    const result: any[] = [];
    const groupedIds = new Set<string>();

    for (const definition of hierarchyDefinition) {
      if (definition.type === 'standalone') {
        const matchItem = definition.matchItems[0];
        const item = menus.find((m) => m.name.toLowerCase() === matchItem.name);
        if (item) {
          result.push({
            id: item.id,
            name: item.name,
            icon: item.icon || definition.icon,
            path: matchItem.path,
            type: 'standalone',
          });
          groupedIds.add(item.id);
        }
      } else {
        // Use map to preserve the order defined in matchItems
        const subItems = definition.matchItems
          .map((mi) => {
            const menu = menus.find((m) => m.name.toLowerCase() === mi.name);
            return menu ? { ...menu, path: mi.path } : null;
          })
          .filter((m) => m !== null);

        if (subItems.length > 0) {
          subItems.forEach((m) => groupedIds.add(m.id));
          result.push({
            id: definition.id,
            name: definition.name,
            icon: definition.icon,
            path: definition.path,
            type: 'group',
            items: subItems.map((m) => ({
              id: m.id,
              name: m.name,
              icon: m.icon,
              path: m.path,
            })),
          });
        }
      }
    }

    // Add any remaining menus at the top level
    const remaining = menus.filter((m) => !groupedIds.has(m.id));
    for (const item of remaining) {
      result.push({
        id: item.id,
        name: item.name,
        icon: item.icon || 'Circle',
        path: item.name.toLowerCase().replace(/\s+/g, '-'),
        type: 'standalone',
      });
    }

    return { data: result, message: 'Hierarchical menus fetched successfully' };
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });
    return { data: menu, message: 'Menu fetched successfully' };
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
    return { data: menu, message: 'Menu updated successfully' };
  }

  async remove(id: string) {
    const menu = await this.prisma.menu.delete({
      where: { id },
    });
    return { data: menu, message: 'Menu deleted successfully' };
  }

  async findUserModule(id: string) {
    const userRole = await this.prisma.userRole.findMany({
      where: {
        userId: id,
      },
    });

    const roleIds = userRole.map((ur) => ur.roleId);

    const roleMenu = await this.prisma.roleMenu.findMany({
      where: {
        roleId: { in: roleIds },
      },
      include: {
        menu: true,
      },
    });

    const totalModules = roleMenu.length;

    return {
      data: roleMenu,
      total: totalModules,
      message: 'User modules fetched successfully',
    };
  }
}
