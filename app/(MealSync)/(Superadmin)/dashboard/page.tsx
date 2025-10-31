'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, MapPin, CreditCard, DollarSign, TrendingUp, Activity, Clock, ShoppingCart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

type DashboardStats = {
  totalOrders: number
  activeCustomers: number
  totalMenuItems: number
  dailyRevenue: number
}

type RecentActivity = {
  id: string
  type: 'order' | 'customer' | 'menu' | 'delivery'
  title: string
  description: string
  timestamp: string
}

const Page = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeCustomers: 0,
    totalMenuItems: 0,
    dailyRevenue: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-email': 'restaurantadmin@example.com'
  }

  async function loadDashboardData() {
    setLoading(true)
    try {
      const [ordersRes, customersRes, menuRes] = await Promise.all([
        axios.get('/api/orders', { headers }),
        axios.get('/api/customers', { headers }),
        axios.get('/api/menu-items', { headers })
      ])

      const orders = ordersRes.data || []
      const customers = customersRes.data || []
      const menuItems = menuRes.data || []

      const activeCustomers = customers.filter((c: any) => c.isActive).length
      const dailyRevenue = orders.reduce((total: number, o: any) => total + (o.totalAmount || 0), 0)

      setStats({
        totalOrders: orders.length,
        activeCustomers,
        totalMenuItems: menuItems.length,
        dailyRevenue
      })

      // Generate recent activity
      const activities: RecentActivity[] = []

      orders.slice(0, 3).forEach((order: any, index: number) => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order Placed',
          description: `Order #${order.id} - $${order.totalAmount}`,
          timestamp: `${index + 1} hour${index > 0 ? 's' : ''} ago`
        })
      })

      customers.slice(0, 2).forEach((c: any, index: number) => {
        activities.push({
          id: `customer-${c.id}`,
          type: 'customer',
          title: 'New Customer Registered',
          description: `${c.firstName} ${c.lastName}`,
          timestamp: `${index + 2} hours ago`
        })
      })

      menuItems.slice(0, 2).forEach((item: any, index: number) => {
        activities.push({
          id: `menu-${item.id}`,
          type: 'menu',
          title: 'Menu Item Added',
          description: `${item.name} - $${item.price}`,
          timestamp: `${index + 3} hours ago`
        })
      })

      setRecentActivity(activities.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-primary" />
      case 'customer':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'menu':
        return <CreditCard className="h-4 w-4 text-green-500" />
      case 'delivery':
        return <MapPin className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
      <div className="min-h-screen w-full bg-background p-6 space-y-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome to your restaurant management dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadDashboardData}
              variant="outline"
              className="border-border hover:bg-accent"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Refreshing...
                </div>
              ) : (
                'Refresh Data'
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{loading ? '...' : stats.totalOrders}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <p className="text-xs text-muted-foreground">Orders today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.activeCustomers}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <p className="text-xs text-muted-foreground">Registered today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.totalMenuItems}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <p className="text-xs text-muted-foreground">Available dishes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{loading ? '...' : `$${stats.dailyRevenue.toLocaleString()}`}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <p className="text-xs text-muted-foreground">From orders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     
          <Card
            className="bg-card border border-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/dashboard/orders')}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                View, update, and manage customer orders.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stats.totalOrders} orders</span>
                <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

        
          <Card
            className="bg-card border border-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/dashboard/customers')}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Add and manage restaurant customers.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stats.activeCustomers} active</span>
                <Button size="sm" variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

      
          <Card
            className="bg-card border border-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/dashboard/menu')}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Menu Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Add or update menu items for your restaurant.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stats.totalMenuItems} items</span>
                <Button size="sm" variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div> */}

       
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
                <p className="text-muted-foreground">Start adding orders, customers, or menu items to see activity here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
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
  )
}

export default Page
