import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const AVAILABLE_WIDGETS = [
  { id: 'deal-metrics', name: 'Deal Performance Metrics', description: 'Closure rates and cycle times' },
  { id: 'market-performance', name: 'Market Performance', description: 'Market trends and sentiment' },
  { id: 'ai-insights', name: 'AI Insights', description: 'AI-generated portfolio recommendations' },
  { id: 'portfolio-health', name: 'Portfolio Health', description: 'Active ideas and performance' },
  { id: 'alerts', name: 'Active Alerts', description: 'Risk and opportunity notifications' },
  { id: 'recent-deals', name: 'Recent Deals', description: 'Latest deal activity' }
];

export default function CustomizableWidgets({ children }) {
  const [activeWidgets, setActiveWidgets] = useState([
    'deal-metrics',
    'market-performance',
    'ai-insights'
  ]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const toggleWidget = (widgetId) => {
    setActiveWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const moveWidget = (widgetId, direction) => {
    const currentIndex = activeWidgets.indexOf(widgetId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= activeWidgets.length) return;

    const newWidgets = [...activeWidgets];
    [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];
    setActiveWidgets(newWidgets);
  };

  return (
    <div className="space-y-6">
      {/* Widget Configuration Bar */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#8b85f7]" />
              <div>
                <h3 className="text-white font-semibold">Dashboard Configuration</h3>
                <p className="text-sm text-[#64748b]">{activeWidgets.length} widgets active</p>
              </div>
            </div>
            
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-[#8b85f7] text-[#8b85f7]">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Widgets
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a0f2e] border-[#2d1e50] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Customize Your Dashboard</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#8b85f7] mb-3">Available Widgets</h4>
                    <div className="space-y-2">
                      {AVAILABLE_WIDGETS.map((widget) => (
                        <div
                          key={widget.id}
                          className="flex items-center justify-between p-3 bg-[#0f0618] rounded-lg border border-[#2d1e50]"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={activeWidgets.includes(widget.id)}
                              onCheckedChange={() => toggleWidget(widget.id)}
                              className="border-[#8b85f7]"
                            />
                            <div>
                              <p className="font-medium text-white">{widget.name}</p>
                              <p className="text-xs text-[#64748b]">{widget.description}</p>
                            </div>
                          </div>
                          {activeWidgets.includes(widget.id) && (
                            <Badge className="bg-[#10b981]/20 text-[#10b981]">Active</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#8b85f7] mb-3">Widget Order</h4>
                    <div className="space-y-2">
                      {activeWidgets.map((widgetId, index) => {
                        const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                        return (
                          <div
                            key={widgetId}
                            className="flex items-center gap-2 p-3 bg-[#0f0618] rounded-lg border border-[#2d1e50]"
                          >
                            <GripVertical className="w-5 h-5 text-[#64748b]" />
                            <span className="flex-1 text-white">{widget?.name}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveWidget(widgetId, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveWidget(widgetId, 'down')}
                                disabled={index === activeWidgets.length - 1}
                                className="h-8 w-8 p-0"
                              >
                                ↓
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfigOpen(false)}
                    className="border-[#2d1e50]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setIsConfigOpen(false)}
                    className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
                  >
                    Save Configuration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Render active widgets in order */}
      <div className="space-y-6">
        {activeWidgets.map((widgetId) => {
          const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
          return (
            <div key={widgetId} className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-[#8b85f7]/20 text-[#8b85f7] text-xs">
                  {widget?.name}
                </Badge>
              </div>
              {React.Children.toArray(children).find(
                child => child.key === widgetId
              )}
            </div>
          );
        })}
      </div>

      {activeWidgets.length === 0 && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="py-12 text-center">
            <EyeOff className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Widgets Active</h3>
            <p className="text-[#64748b] mb-4">Add widgets to customize your dashboard</p>
            <Button
              onClick={() => setIsConfigOpen(true)}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Widgets
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}