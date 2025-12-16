"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineCube,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "blue" | "green" | "yellow" | "purple";
  trend?: { value: number; isPositive: boolean };
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Quick Action Card
function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <a
      href={href}
      className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}

interface RecentActivity {
  id: string;
  type: "issuance" | "completed";
  materialTitle: string;
  schoolName: string;
  quantity: number;
  date: string;
}

interface DashboardStats {
  totalMaterials: number;
  totalSchools: number;
  pendingIssuances: number;
  completedIssuances: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterials: 0,
    totalSchools: 0,
    pendingIssuances: 0,
    completedIssuances: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all stats in parallel
        const [materialsRes, schoolsRes, issuancesRes, historyRes] = await Promise.all([
          fetch("/api/materials?limit=1"),
          fetch("/api/schools?limit=1"),
          fetch("/api/issuances?status=PENDING&limit=1"),
          fetch("/api/history?limit=5"),
        ]);

        const [materialsData, schoolsData, issuancesData, historyData] = await Promise.all([
          materialsRes.json(),
          schoolsRes.json(),
          issuancesRes.json(),
          historyRes.json(),
        ]);

        // Get completed count
        const completedRes = await fetch("/api/history?limit=1");
        const completedData = await completedRes.json();

        setStats({
          totalMaterials: materialsData.data?.pagination?.total || 0,
          totalSchools: schoolsData.data?.pagination?.total || 0,
          pendingIssuances: issuancesData.data?.pagination?.total || 0,
          completedIssuances: completedData.data?.pagination?.total || 0,
        });

        // Format recent activity from completed issuances
        if (historyData.data?.completedIssuances) {
          const activities: RecentActivity[] = historyData.data.completedIssuances.map(
            (item: { id: string; material: { title: string }; school: { name: string }; quantity: number; deliveredAt: string }) => ({
              id: item.id,
              type: "completed" as const,
              materialTitle: item.material?.title || "Unknown Material",
              schoolName: item.school?.name || "Unknown School",
              quantity: item.quantity,
              date: item.deliveredAt,
            })
          );
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome to DepEd LR Inventory! 👋
        </h1>
        <p className="text-blue-100 mt-1">
          Here&apos;s what&apos;s happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Materials"
          value={stats.totalMaterials.toLocaleString()}
          icon={HiOutlineCube}
          color="blue"
        />
        <StatsCard
          title="Total Schools"
          value={stats.totalSchools.toLocaleString()}
          icon={HiOutlineAcademicCap}
          color="green"
        />
        <StatsCard
          title="Pending Issuances"
          value={stats.pendingIssuances.toLocaleString()}
          icon={HiOutlineClipboardList}
          color="yellow"
        />
        <StatsCard
          title="Completed Issuances"
          value={stats.completedIssuances.toLocaleString()}
          icon={HiOutlineCheckCircle}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Issue Materials"
            description="Distribute learning resources to schools"
            href="/issue-items"
            icon={HiOutlineClipboardList}
          />
          <QuickAction
            title="Add New Material"
            description="Add new learning resources to inventory"
            href="/inventory"
            icon={HiOutlineCube}
          />
          <QuickAction
            title="Manage Schools"
            description="View and manage school records"
            href="/schools"
            icon={HiOutlineAcademicCap}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Completed Issuances</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.materialTitle} issued to {activity.schoolName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.date)} • {activity.quantity} items
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Completed
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HiOutlineClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
