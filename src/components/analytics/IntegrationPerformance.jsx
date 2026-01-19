import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const INTEGRATION_DATA = [
  { name: 'Stripe', deals: 45, revenue: 125000, status: 'active', uptime: 99.9, responseTime: 120 },
  { name: 'Airtable', deals: 38, revenue: 0, status: 'active', uptime: 98.5, responseTime: 250 },
  { name: 'Zapier', deals: 52, revenue: 0, status: 'active', uptime: 99.2, responseTime: 180 },
  { name: 'Google Calendar', deals: 67, revenue: 0, status: 'active', uptime: 99.8, responseTime: 95 },
  { name: 'Custom Webhooks', deals: 23, revenue: 0, status: 'warning', uptime: 97.1, responseTime: 340 }
];

const PERFORMANCE_TIMELINE = [
  { time: '00:00', requests: 45, errors: 2 },
  { time: '04:00', requests: 32, errors: 1 },
  { time: '08:00', requests: 89, errors: 3 },
  { time: '12:00', requests: 124, errors: 5 },
  { time: '16:00', requests: 156, errors: 4 },
  { time: '20:00', requests: 98, errors: 2 }
];

export default function IntegrationPerformance() {
  return (
    <div className="space-y-6">
      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATION_DATA.map(integration => (
          <Card key={integration.name} className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#8b85f7]/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#8b85f7]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{integration.name}</h3>
                    <Badge 
                      variant={integration.status === 'active' ? 'default' : 'destructive'}
                      className="mt-1"
                    >
                      {integration.status === 'active' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Deals Processed</span>
                  <span className="text-white font-semibold">{integration.deals}</span>
                </div>
                {integration.revenue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-green-400 font-semibold">
                      ${(integration.revenue / 1000).toFixed(1)}K
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uptime</span>
                  <span className={`font-semibold ${
                    integration.uptime > 99 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {integration.uptime}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Response</span>
                  <span className="text-blue-400 font-semibold">{integration.responseTime}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals by Integration */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-[#8b85f7]" />
              Deals by Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={INTEGRATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a0f2e', 
                    border: '1px solid #2d1e50',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="deals" fill="#8b85f7" name="Deals" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-green-500" />
              API Performance (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={PERFORMANCE_TIMELINE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a0f2e', 
                    border: '1px solid #2d1e50',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#00b7eb" 
                  strokeWidth={2}
                  name="Requests"
                  dot={{ fill: '#00b7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Errors"
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}