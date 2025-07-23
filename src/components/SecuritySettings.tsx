import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Key, 
  Users, 
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Trash2,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityEvent {
  id: string;
  type: 'login' | 'export' | 'access' | 'config';
  user: string;
  action: string;
  timestamp: Date;
  ip: string;
  status: 'success' | 'failed' | 'warning';
}

export default function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    ipWhitelist: true,
    dataEncryption: true,
    auditLogging: true,
    accessControl: true,
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      expiryDays: 90
    },
    dataRetention: {
      resumeData: 365,
      auditLogs: 730,
      exportFiles: 30
    }
  });

  const [auditLogs] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      user: 'john.doe@company.com',
      action: 'Successful login',
      timestamp: new Date('2025-01-16T10:30:00'),
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      type: 'export',
      user: 'sarah.manager@company.com',
      action: 'Data export - 1,247 records',
      timestamp: new Date('2025-01-16T09:15:00'),
      ip: '192.168.1.105',
      status: 'success'
    },
    {
      id: '3',
      type: 'access',
      user: 'unknown@external.com',
      action: 'Failed login attempt',
      timestamp: new Date('2025-01-16T08:45:00'),
      ip: '203.0.113.42',
      status: 'failed'
    },
    {
      id: '4',
      type: 'config',
      user: 'admin@company.com',
      action: 'Security settings updated',
      timestamp: new Date('2025-01-15T16:20:00'),
      ip: '192.168.1.101',
      status: 'warning'
    }
  ]);

  const [apiKeys] = useState([
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_****************************',
      created: new Date('2025-01-01'),
      lastUsed: new Date('2025-01-16'),
      permissions: ['read', 'write'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'pk_test_****************************',
      created: new Date('2025-01-10'),
      lastUsed: new Date('2025-01-15'),
      permissions: ['read'],
      status: 'active'
    }
  ]);

  const { toast } = useToast();

  const updateSetting = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Security setting updated",
      description: "Your security configuration has been saved"
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Users className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'access':
        return <Eye className="w-4 h-4" />;
      case 'config':
        return <Settings className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security & Compliance</h2>
          <p className="text-muted-foreground">
            Manage security settings, access controls, and compliance features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            GDPR Compliant
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Shield className="w-4 h-4 mr-1" />
            SOC 2 Certified
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Session Timeout (minutes)</Label>
                  <Select
                    value={securitySettings.sessionTimeout.toString()}
                    onValueChange={(value) => updateSetting('sessionTimeout', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">IP Whitelist</Label>
                    <p className="text-xs text-muted-foreground">Restrict access to specific IPs</p>
                  </div>
                  <Switch
                    checked={securitySettings.ipWhitelist}
                    onCheckedChange={(checked) => updateSetting('ipWhitelist', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Data Encryption</Label>
                    <p className="text-xs text-muted-foreground">AES-256 encryption at rest</p>
                  </div>
                  <Switch
                    checked={securitySettings.dataEncryption}
                    onCheckedChange={(checked) => updateSetting('dataEncryption', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Audit Logging</Label>
                    <p className="text-xs text-muted-foreground">Log all user activities</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data Retention (days)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Resume Data</Label>
                      <Input
                        type="number"
                        value={securitySettings.dataRetention.resumeData}
                        onChange={(e) => updateSetting('dataRetention', {
                          ...securitySettings.dataRetention,
                          resumeData: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Audit Logs</Label>
                      <Input
                        type="number"
                        value={securitySettings.dataRetention.auditLogs}
                        onChange={(e) => updateSetting('dataRetention', {
                          ...securitySettings.dataRetention,
                          auditLogs: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Export Files</Label>
                      <Input
                        type="number"
                        value={securitySettings.dataRetention.exportFiles}
                        onChange={(e) => updateSetting('dataRetention', {
                          ...securitySettings.dataRetention,
                          exportFiles: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum Length</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => updateSetting('passwordPolicy', {
                      ...securitySettings.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Expiry (days)</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.expiryDays}
                    onChange={(e) => updateSetting('passwordPolicy', {
                      ...securitySettings.passwordPolicy,
                      expiryDays: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => updateSetting('passwordPolicy', {
                      ...securitySettings.passwordPolicy,
                      requireSpecialChars: checked
                    })}
                  />
                  <Label className="text-sm">Special Characters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => updateSetting('passwordPolicy', {
                      ...securitySettings.passwordPolicy,
                      requireNumbers: checked
                    })}
                  />
                  <Label className="text-sm">Numbers Required</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Keys
                </span>
                <Button size="sm">
                  Generate New Key
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{key.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{key.key}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                        <span>Created: {key.created.toLocaleDateString()}</span>
                        <span>Last used: {key.lastUsed.toLocaleDateString()}</span>
                        <div className="flex space-x-1">
                          {key.permissions.map(perm => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Security Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${getStatusColor(event.status)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.action}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{event.user}</span>
                        <span>•</span>
                        <span>{event.ip}</span>
                        <span>•</span>
                        <span>{event.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant={
                      event.status === 'success' ? 'default' :
                      event.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Data Processing Agreement in place</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Right to be forgotten implemented</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Data portability enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Consent management active</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">ISO 27001 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">CCPA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">HIPAA Assessment Pending</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}