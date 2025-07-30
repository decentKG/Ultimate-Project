import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SystemMetrics {
  cpu: {
    load: number;
    cores: number;
    speed: string;
  };
  memory: {
    total: string;
    used: string;
    free: string;
    usage: number;
  };
  os: {
    platform: string;
    release: string;
  };
  uptime: string;
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch this from a backend API
    // For demonstration, we'll use mock data
    const loadMetrics = async () => {
      try {
        // This would be an API call in a real app:
        // const response = await fetch('/api/system-metrics');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData: SystemMetrics = {
          cpu: {
            load: Math.random() * 100,
            cores: navigator.hardwareConcurrency || 4,
            speed: '2.9 GHz'
          },
          memory: {
            total: '16 GB',
            used: `${(8 + Math.random() * 4).toFixed(2)} GB`,
            free: `${(8 - Math.random() * 4).toFixed(2)} GB`,
            usage: 30 + Math.random() * 50
          },
          os: {
            platform: navigator.platform,
            release: '1.0.0'
          },
          uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`
        };
        
        setMetrics(mockData);
      } catch (err) {
        setError('Failed to load system metrics');
        console.error('Error loading system metrics:', err);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!metrics) {
    return <div>Loading system metrics...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>CPU Usage</span>
            <span>{metrics.cpu.load.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.cpu.load} className="h-2" />
          <div className="text-sm text-muted-foreground mt-1">
            {metrics.cpu.cores} cores @ {metrics.cpu.speed}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Memory Usage</span>
            <span>{metrics.memory.used} / {metrics.memory.total}</span>
          </div>
          <Progress value={metrics.memory.usage} className="h-2" />
          <div className="text-sm text-muted-foreground mt-1">
            {metrics.memory.free} free
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">OS</div>
            <div className="text-muted-foreground">
              {metrics.os.platform} {metrics.os.release}
            </div>
          </div>
          <div>
            <div className="font-medium">Uptime</div>
            <div className="text-muted-foreground">{metrics.uptime}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
