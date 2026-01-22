import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#8b85f7', '#00b7eb', '#ff8e42', '#ff69b4', '#10b981', '#f59e0b'];

export default function AllocationVisualization({ investments }) {
  const industryAllocation = React.useMemo(() => {
    const allocation = {};
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment), 0);

    investments.forEach(inv => {
      const value = inv.current_value || inv.initial_investment;
      allocation[inv.industry] = (allocation[inv.industry] || 0) + value;
    });

    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalValue) * 100).toFixed(1)
    }));
  }, [investments]);

  const assetTypeAllocation = React.useMemo(() => {
    const allocation = {};
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment), 0);

    investments.forEach(inv => {
      const value = inv.current_value || inv.initial_investment;
      allocation[inv.asset_type] = (allocation[inv.asset_type] || 0) + value;
    });

    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalValue) * 100).toFixed(1)
    }));
  }, [investments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            <PieIcon className="w-5 h-5 text-[#8b85f7]" />
            Allocation by Industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={industryAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {industryAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#00b7eb] to-[#ff8e42] bg-clip-text text-transparent">
            <PieIcon className="w-5 h-5 text-[#00b7eb]" />
            Allocation by Asset Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetTypeAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetTypeAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}