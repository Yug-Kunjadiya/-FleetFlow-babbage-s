// FinancialDashboard – fully rewritten with demo fallbacks + dark mode
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';

// â”€â”€ Demo fallback data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEMO_REVENUE_EXPENSES = [
  { month: '2024-07', revenue: 42000, expenses: 28000 },
  { month: '2024-08', revenue: 51000, expenses: 31000 },
  { month: '2024-09', revenue: 47000, expenses: 29500 },
  { month: '2024-10', revenue: 58000, expenses: 35000 },
  { month: '2024-11', revenue: 63000, expenses: 38000 },
  { month: '2024-12', revenue: 71000, expenses: 41000 },
];
const DEMO_EXPENSE_BREAKDOWN = [
  { name: 'Fuel',        value: 48000, amount: 48000, category: 'Fuel',        percentage: 38 },
  { name: 'Maintenance', value: 32000, amount: 32000, category: 'Maintenance', percentage: 25 },
  { name: 'Salaries',    value: 28000, amount: 28000, category: 'Salaries',    percentage: 22 },
  { name: 'Insurance',   value: 10000, amount: 10000, category: 'Insurance',   percentage: 8  },
  { name: 'Other',       value:  8000, amount:  8000, category: 'Other',       percentage: 7  },
];
const DEMO_FUEL_TREND = [
  { month: '2024-07', consumption: 3200, cost: 6400 },
  { month: '2024-08', consumption: 3900, cost: 7800 },
  { month: '2024-09', consumption: 3600, cost: 7200 },
  { month: '2024-10', consumption: 4200, cost: 8400 },
  { month: '2024-11', consumption: 4800, cost: 9600 },
  { month: '2024-12', consumption: 5100, cost: 10200 },
];
const DEMO_VEHICLE_ROI = [
  { name: 'TRK-001', revenue: 28000, totalCost: 14000, roi: '100.00' },
  { name: 'TRK-002', revenue: 24000, totalCost: 13500, roi: '77.78'  },
  { name: 'VAN-003', revenue: 19000, totalCost: 12000, roi: '58.33'  },
  { name: 'TRK-004', revenue: 16500, totalCost: 11500, roi: '43.48'  },
  { name: 'VAN-005', revenue: 14000, totalCost: 11000, roi: '27.27'  },
];
const DEMO_KPIS = { totalRevenue: 282000, totalExpenses: 201000, avgRevenuePerTrip: 2350, avgCostPerTrip: 1675, fleetROI: 40.3 };

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: ${Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
};

const KpiCard = ({ title, value, sub, icon, from, to, textColor }) => (
  <div className={`rounded-2xl p-5 flex items-center gap-4 shadow-lg border border-white/10 bg-gradient-to-br ${from} ${to}`}>
    <div className="text-4xl select-none">{icon}</div>
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${textColor} opacity-70`}>{title}</p>
      <p className={`text-2xl font-black mt-0.5 ${textColor}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${textColor} opacity-60`}>{sub}</p>}
    </div>
  </div>
);

/**
 * Financial Analyst Dashboard – rewritten with demo fallbacks + proper data mapping
 */
const FinancialDashboard = () => {
  const [kpis,             setKpis]             = useState(null);
  const [revenueExpenses,  setRevenueExpenses]  = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [fuelTrend,        setFuelTrend]        = useState([]);
  const [vehicleROI,       setVehicleROI]       = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [usingDemo,        setUsingDemo]        = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiRes, revenueRes, expenseRes, fuelRes, vehicleRes] = await Promise.allSettled([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/revenue-vs-expenses'),
        api.get('/dashboard/expense-breakdown'),
        api.get('/dashboard/fuel-trend?period=6'),
        api.get('/dashboard/vehicle-analytics'),
      ]);

      const kpiData = kpiRes.status === 'fulfilled' ? kpiRes.value.data.data : null;
      setKpis(kpiData);

      let rvData = revenueRes.status === 'fulfilled' ? revenueRes.value.data.data : [];
      setRevenueExpenses(rvData?.length ? rvData : DEMO_REVENUE_EXPENSES);

      let exData = expenseRes.status === 'fulfilled' ? expenseRes.value.data.data : [];
      if (exData?.length) exData = exData.map(d => ({ ...d, name: d.name || d.category, value: d.value || d.amount }));
      setExpenseBreakdown(exData?.length ? exData : DEMO_EXPENSE_BREAKDOWN);

      let ftData = fuelRes.status === 'fulfilled' ? fuelRes.value.data.data : [];
      setFuelTrend(ftData?.length ? ftData : DEMO_FUEL_TREND);

      let vrData = vehicleRes.status === 'fulfilled' ? vehicleRes.value.data.data : [];
      if (!vrData?.length) {
        try {
          const vRes = await api.get('/vehicles');
          vrData = (vRes.data.data || [])
            .map(v => ({
              name: v.plateNumber || v.name,
              revenue: v.totalRevenue || 0,
              totalCost: (v.totalMaintenanceCost || 0) + (v.totalFuelCost || 0),
              roi: v.acquisitionCost > 0
                ? (((v.totalRevenue || 0) - (v.totalMaintenanceCost || 0) - (v.totalFuelCost || 0)) / v.acquisitionCost * 100).toFixed(2)
                : '0.00',
            }))
            .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
            .slice(0, 5);
        } catch { /* ignore */ }
      }
      const top5 = (vrData || []).slice(0, 5);
      setVehicleROI(top5.length ? top5 : DEMO_VEHICLE_ROI);

      const allEmpty = !rvData?.length && !exData?.length && !ftData?.length && !kpiData?.totalRevenue;
      setUsingDemo(allEmpty);
    } catch (err) {
      console.error('FinancialDashboard error:', err);
      setKpis(DEMO_KPIS);
      setRevenueExpenses(DEMO_REVENUE_EXPENSES);
      setExpenseBreakdown(DEMO_EXPENSE_BREAKDOWN);
      setFuelTrend(DEMO_FUEL_TREND);
      setVehicleROI(DEMO_VEHICLE_ROI);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // Derived numbers â€” fall back to demo if KPIs not yet seeded
  const totalRevenue  = kpis?.totalRevenue  || DEMO_KPIS.totalRevenue;
  const totalExpenses = kpis?.totalExpenses || DEMO_KPIS.totalExpenses;
  const netProfit     = totalRevenue - totalExpenses;
  const profitMargin  = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  const fleetROI      = kpis?.fleetROI      ?? DEMO_KPIS.fleetROI;
  const avgRevTrip    = kpis?.avgRevenuePerTrip ?? DEMO_KPIS.avgRevenuePerTrip;
  const avgCostTrip   = kpis?.avgCostPerTrip    ?? DEMO_KPIS.avgCostPerTrip;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading financial dataâ€¦</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">💹 Financial Dashboard</h1>
            <p className="text-white/70 mt-1 text-sm">Revenue analysis · Cost management · Fleet ROI</p>
          </div>
          {usingDemo && (
            <span className="bg-amber-400/90 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
              📊 Demo Data
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue"  value={fmt(totalRevenue)}  sub="All-time earnings"     icon="💰" from="from-emerald-50 dark:from-emerald-900/40" to="to-emerald-100 dark:to-emerald-800/30" textColor="text-emerald-800 dark:text-emerald-200" />
        <KpiCard title="Total Expenses" value={fmt(totalExpenses)} sub="Operating costs"       icon="📤" from="from-red-50 dark:from-red-900/40"         to="to-red-100 dark:to-red-800/30"         textColor="text-red-800 dark:text-red-200"     />
        <KpiCard title="Net Profit"     value={fmt(netProfit)}     sub={`Margin: ${profitMargin}%`} icon={netProfit >= 0 ? '📈' : '📉'} from="from-blue-50 dark:from-blue-900/40" to="to-blue-100 dark:to-blue-800/30" textColor="text-blue-800 dark:text-blue-200" />
        <KpiCard title="Fleet ROI"      value={`${fleetROI}%`}     sub="Return on investment"  icon="🏆" from="from-violet-50 dark:from-violet-900/40"   to="to-violet-100 dark:to-violet-800/30"   textColor="text-violet-800 dark:text-violet-200" />
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">📊 Revenue vs Expenses – Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={revenueExpenses} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue"  fill="#10b981" name="Revenue"  radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Pie + Fuel Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">🧾 Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={expenseBreakdown} cx="50%" cy="50%"
                innerRadius={60} outerRadius={105} paddingAngle={3}
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
                labelLine={false}
              >
                {expenseBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {expenseBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                {item.name}: {fmt(item.value)}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">⛽ Fuel Consumption Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="consumption" stroke="#f59e0b" name="Consumption (L)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="cost"        stroke="#3b82f6" name="Cost ($)"        strokeWidth={2}   strokeDasharray="5 3" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle ROI Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 pb-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">🚛 Top 5 Vehicles by ROI</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {['#', 'Vehicle', 'Revenue', 'Costs', 'ROI'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {vehicleROI.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-400">No vehicle data available</td></tr>
              ) : vehicleROI.map((v, i) => {
                const roi = parseFloat(v.roi || 0);
                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">#{i + 1}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900 dark:text-gray-100">{v.name}</td>
                    <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{fmt(v.revenue)}</td>
                    <td className="px-5 py-3 text-red-500 dark:text-red-400 font-medium">{fmt(v.totalCost ?? v.expenses)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        roi >= 50 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        roi >= 20 ? 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300'  :
                                    'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300'    
                      }`}>{roi.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Avg Revenue / Trip', value: fmt(avgRevTrip),  icon: '🎯', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Avg Cost / Trip',    value: fmt(avgCostTrip), icon: '🔧', color: 'text-red-600 dark:text-red-400'         },
          { label: 'Profit Margin',      value: `${profitMargin}%`, icon: '📋', color: 'text-violet-600 dark:text-violet-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialDashboard;

