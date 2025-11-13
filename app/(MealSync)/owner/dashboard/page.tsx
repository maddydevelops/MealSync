"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, DollarSign, Package, MessageSquare } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from "recharts";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

type Stats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalIncome: number;
};

type Order = {
  id: string;
  user: string;
  total: number;
  status: string;
  createdAt: string;
};

type IncomeData = {
  date: string;
  income: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalIncome: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeData[]>([]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/dashboard/stats");
      setStats(res.data.stats);
      setRecentOrders(res.data.recentOrders);
      setIncomeData(res.data.incomeData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <section className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-gradient">{session?.user?.name || "Admin"}!</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here’s what’s happening with your store today.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:opacity-90 transition-all">
          View Reports
        </Button>
      </motion.div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Users", icon: Users, value: stats.totalUsers, color: "text-blue-500" },
          { title: "Total Products", icon: Package, value: stats.totalProducts, color: "text-green-500" },
          { title: "Total Orders", icon: ShoppingCart, value: stats.totalOrders, color: "text-yellow-500" },
          { title: "Total Income", icon: DollarSign, value: stats.totalIncome, color: "text-purple-500", prefix: "$" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
          >
            <Card className="bg-card text-card-foreground shadow hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{stat.title}</CardTitle>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  <CountUp end={stat.value} duration={1.5} prefix={stat.prefix || ""} />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Income Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-card text-card-foreground shadow mt-6">
          <CardHeader>
            <CardTitle>Income Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-card text-card-foreground shadow mt-6">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-border rounded">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">User</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="border-t border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-2">{order.id}</td>
                      <td className="p-2">{order.user}</td>
                      <td className="p-2">${order.total}</td>
                      <td className="p-2">{order.status}</td>
                      <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Messages Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-card text-card-foreground shadow mt-6">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-2">
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-primary/20 p-2 rounded-lg">Hi, how can I help you?</div>
              </motion.div>
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="bg-primary p-2 rounded-lg text-white">I want to check my order status</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
