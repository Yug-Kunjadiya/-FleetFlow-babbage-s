import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Truck, MapPin, DollarSign, BarChart2, TrendingUp, Clock, CheckCircle, Users } from "lucide-react";
import api from "../../services/api";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !target) return;
    started.current = true;
    const frames = Math.max(1, Math.floor(duration / 16));
    const step = target / frames;
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(Math.round(cur));
      if (cur >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function KpiCard({ title, value, rawValue, sub, icon: Icon, color, prefix = "", suffix = "" }) {
  const animated = useCounter(rawValue ?? (typeof value === "number" ? value : 0));
  const colorMap = {
    blue:   { bg:"bg-blue-50 dark:bg-blue-900/20",   icon:"bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",   text:"text-blue-700 dark:text-blue-300" },
    green:  { bg:"bg-green-50 dark:bg-green-900/20", icon:"bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400", text:"text-green-700 dark:text-green-300" },
    amber:  { bg:"bg-amber-50 dark:bg-amber-900/20", icon:"bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400", text:"text-amber-700 dark:text-amber-300" },
    violet: { bg:"bg-violet-50 dark:bg-violet-900/20", icon:"bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400", text:"text-violet-700 dark:text-violet-300" },
  };
  const c = colorMap[color] || colorMap.blue;
  const display = rawValue !== undefined ? `${prefix}${animated.toLocaleString()}${suffix}` : value;
  return (
    <div className={`${c.bg} rounded-2xl p-5 border border-white/60 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-black mt-1.5 ${c.text}`}>{display}</p>
          {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

const DEMO_REV_EXP = [
  { month:"2025-10", revenue:58000, expenses:35000 },
  { month:"2025-11", revenue:63000, expenses:38000 },
  { month:"2025-12", revenue:71000, expenses:41000 },
  { month:"2026-01", revenue:66000, expenses:44000 },
  { month:"2026-02", revenue:15000, expenses:80000 },
];
const DEMO_UTILIZATION = [
  { month:"2025-10", utilization:62 }, { month:"2025-11", utilization:68 },
  { month:"2025-12", utilization:74 }, { month:"2026-01", utilization:71 }, { month:"2026-02", utilization:78 },
];
const DEMO_FUEL = [
  { month:"2025-10", consumption:4200, cost:8400 }, { month:"2025-11", consumption:4800, cost:9600 },
  { month:"2025-12", consumption:5100, cost:10200 }, { month:"2026-01", consumption:4600, cost:9200 },
  { month:"2026-02", consumption:3200, cost:6400 },
];
const DEMO_EXPENSE = [
  { name:"Fuel", value:48000 }, { name:"Maintenance", value:32000 },
  { name:"Salaries", value:28000 }, { name:"Insurance", value:10000 }, { name:"Other", value:8000 },
];

const ManagerDashboard = () => {
  const [kpis, setKpis]                         = useState(null);
  const [fuelTrend, setFuelTrend]               = useState([]);
  const [revenueExpenses, setRevenueExpenses]   = useState([]);
  const [utilization, setUtilization]           = useState([]);
  const [topDrivers, setTopDrivers]             = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [demo, setDemo]                         = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [kpiRes, fuelRes, revRes, utilRes, drvRes, expRes] = await Promise.all([
        api.get("/dashboard/kpis"),
        api.get("/dashboard/fuel-trend"),
        api.get("/dashboard/revenue-vs-expenses"),
        api.get("/dashboard/utilization-trend"),
        api.get("/dashboard/top-drivers"),
        api.get("/dashboard/expense-breakdown"),
      ]);
      setKpis(kpiRes.data.data);
      setFuelTrend(fuelRes.data.data?.length ? fuelRes.data.data : DEMO_FUEL);
      setRevenueExpenses(revRes.data.data?.length ? revRes.data.data : DEMO_REV_EXP);
      setUtilization(utilRes.data.data?.length ? utilRes.data.data : DEMO_UTILIZATION);
      setTopDrivers(drvRes.data.data || []);
      setExpenseBreakdown(expRes.data.data?.length ? expRes.data.data : DEMO_EXPENSE);
      setDemo(!revRes.data.data?.length && !utilRes.data.data?.length);
    } catch {
      setRevenueExpenses(DEMO_REV_EXP); setUtilization(DEMO_UTILIZATION);
      setFuelTrend(DEMO_FUEL);          setExpenseBreakdown(DEMO_EXPENSE);
      setDemo(true);
    } finally { setLoading(false); }
  };

  const utilizationVal = kpis?.utilizationRate ?? kpis?.utilization ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Fleet Manager Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Complete fleet overview and performance metrics</p>
        </div>
        {demo && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-semibold border border-amber-200 dark:border-amber-700">
            Demo Data
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Vehicles"    rawValue={kpis?.totalVehicles || 0}         sub="In fleet"               icon={Truck}        color="blue"   />
        <KpiCard title="Active Trips"      rawValue={kpis?.activeTrips || 0}            sub="Currently dispatched"   icon={MapPin}       color="green"  />
        <KpiCard title="Total Revenue"     rawValue={kpis?.totalRevenue || 0}           sub="All-time earnings"      icon={DollarSign}   color="amber"  prefix="$" />
        <KpiCard title="Fleet Utilization" value={`${parseFloat(utilizationVal).toFixed(1)}%`} sub="Vehicles on trip" icon={BarChart2} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue vs Expenses">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueExpenses} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="#9ca3af" tickLine={false} />
              <YAxis tick={{ fontSize:11 }} stroke="#9ca3af" tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4,4,0,0]} />
              <Bar dataKey="revenue"  fill="#3b82f6" name="Revenue"  radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fleet Utilization Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={utilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="#9ca3af" tickLine={false} />
              <YAxis tick={{ fontSize:11 }} stroke="#9ca3af" tickLine={false} domain={[0,100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="utilization" stroke="#10b981" name="Utilization %" strokeWidth={2.5} dot={{ r:4 }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fuel Consumption Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="#9ca3af" tickLine={false} />
              <YAxis tick={{ fontSize:11 }} stroke="#9ca3af" tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="consumption" stroke="#f59e0b" name="Liters"    strokeWidth={2} dot={{ r:3 }} />
              <Line type="monotone" dataKey="cost"        stroke="#3b82f6" name="Cost ($)"  strokeWidth={2} strokeDasharray="5 3" dot={{ r:3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%"
                innerRadius={55} outerRadius={100} paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Completed This Month" rawValue={kpis?.completedTripsThisMonth || 0} sub="Trips"               icon={CheckCircle} color="green"  />
        <KpiCard title="Available Drivers"    rawValue={kpis?.availableDrivers || 0}        sub="On duty"             icon={Users}       color="blue"   />
        <KpiCard title="Avg Revenue / Trip"   rawValue={kpis?.avgRevenuePerTrip || 0}       sub="Per completed trip"  icon={TrendingUp}  color="amber"  prefix="$" />
        <KpiCard title="Fleet ROI"            value={`${kpis?.fleetROI ?? 0}%`}              sub="Return on investment" icon={BarChart2}  color="violet" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Top Performing Drivers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {["#","Driver","Total Trips","Completed","Completion Rate","Avg Time","Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {topDrivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No driver performance data yet. Complete some trips first.</p>
                    </div>
                  </td>
                </tr>
              ) : topDrivers.map((d, i) => {
                const rate = parseFloat(d.completionRate || 0);
                const avgH = d.avgCompletionTime;
                const avgTime = avgH
                  ? `${Math.floor(avgH)}h ${Math.round((avgH % 1) * 60)}m`
                  : "—";
                return (
                  <tr key={d.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-5 py-3 font-bold text-gray-400 dark:text-gray-500">#{i+1}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900 dark:text-gray-100">{d.name}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{d.totalTrips ?? 0}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{d.completedTrips ?? 0}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        rate >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        rate >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>{rate.toFixed(1)}%</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 opacity-50" />{avgTime}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.status === "On Trip"   ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        d.status === "On Duty"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        d.status === "Suspended" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                   "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
