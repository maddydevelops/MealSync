'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

type DashboardStats = {
  totalOrders: number;
  activeCustomers: number;
  totalMenuItems: number;
  dailyRevenue: number;
};

type RecentActivity = {
  id: string;
  type: 'order' | 'customer' | 'menu' | 'delivery';
  title: string;
  description: string;
  timestamp: string;
};

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeCustomers: 0,
    totalMenuItems: 0,
    dailyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-email': 'restaurantadmin@example.com',
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes, menuRes] = await Promise.all([
        axios.get('/api/orders', { headers }),
        axios.get('/api/customers', { headers }),
        axios.get('/api/menu-items', { headers }),
      ]);

      const orders = ordersRes.data || [];
      const customers = customersRes.data || [];
      const menuItems = menuRes.data || [];

      const activeCustomers = customers.filter((c: any) => c.isActive).length;
      const dailyRevenue = orders.reduce(
        (total: number, o: any) => total + (o.totalAmount || 0),
        0
      );

      setStats({
        totalOrders: orders.length,
        activeCustomers,
        totalMenuItems: menuItems.length,
        dailyRevenue,
      });

      const activities: RecentActivity[] = [];

      orders.slice(0, 3).forEach((order: any, index: number) => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order Placed',
          description: `Order #${order.id} - $${order.totalAmount}`,
          timestamp: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
        });
      });

      customers.slice(0, 2).forEach((c: any, index: number) => {
        activities.push({
          id: `customer-${c.id}`,
          type: 'customer',
          title: 'New Customer Registered',
          description: `${c.firstName} ${c.lastName}`,
          timestamp: `${index + 2} hours ago`,
        });
      });

      menuItems.slice(0, 2).forEach((item: any, index: number) => {
        activities.push({
          id: `menu-${item.id}`,
          type: 'menu',
          title: 'Menu Item Added',
          description: `${item.name} - $${item.price}`,
          timestamp: `${index + 3} hours ago`,
        });
      });

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/login"); 
  }
  if (status === "authenticated") {
    loadDashboardData();
  }
}, [status, router]);

const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-primary" />;
      case 'customer':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'menu':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'delivery':
        return <MapPin className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your restaurant management dashboard
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          variant="outline"
          className="border-border hover:bg-accent"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">Orders today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeCustomers}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">Registered today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menu Items
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalMenuItems}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">Available dishes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${stats.dailyRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">From orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading activity...</span>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
              <p className="text-muted-foreground">
                Start adding orders, customers, or menu items to see activity here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
