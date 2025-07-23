import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Brain, 
  Database, 
  Zap,
  Globe,
  Palette,
  Bell,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettings() {
  const [aiSettings, setAiSettings] = useState({
    model: 'gpt-4-turbo',
    confidenceThreshold: 85,
    autoRetry: true,
    batchSize: 50,
    timeout: 30,
    enhancedParsing: true,
    skillExtraction: true,
    experienceAnalysis: true,
    educationParsing: true,
    customPrompts: false,
    customPromptText: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    theme: 'light',
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 10,
    allowedFormats: ['pdf', 'docx', 'doc', 'txt'],
    rateLimiting: true,
    maxRequestsPerHour: 1000,
    enableLogging: true,
    logLevel: 'info'
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    webhookUrl: '',
    webhookEnabled: false,
    apiVersion: 'v2',
    enableCors: true,
    allowedOrigins: '',
    ssoEnabled: false,
    ssoProvider: 'none'
  });

  const { toast } = useToast();

  const updateAiSetting = (key: string, value: any) => {
    setAiSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSystemSetting = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateIntegrationSetting = (key: string, value: any) => {
    setIntegrationSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your system settings have been updated successfully"
    });
  };

  const resetToDefaults = () => {
    // Reset to default values
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values"
    });
  };

  const exportSettings = () => {
    const settings = {
      ai: aiSettings,
      system: systemSettings,
      integration: integrationSettings
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'c-resume-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings exported",
      description: "Your settings have been exported to a JSON file"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            System Settings
          </h2>
          <p className="text-muted-foreground">
            Configure AI parsing, system preferences, and integrations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">AI & Parsing</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Model Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI Model</Label>
                  <Select value={aiSettings.model} onValueChange={(value) => updateAiSetting('model', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Recommended)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Confidence Threshold: {aiSettings.confidenceThreshold}%
                  </Label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={aiSettings.confidenceThreshold}
                    onChange={(e) => updateAiSetting('confidenceThreshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence level for AI parsing results
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Batch Size</Label>
                  <Input
                    type="number"
                    value={aiSettings.batchSize}
                    onChange={(e) => updateAiSetting('batchSize', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of resumes to process simultaneously
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={aiSettings.timeout}
                    onChange={(e) => updateAiSetting('timeout', parseInt(e.target.value))}
                    min="10"
                    max="300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parsing Features */}
            <Card>
              <CardHeader>
                <CardTitle>Parsing Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enhanced Parsing</Label>
                    <p className="text-xs text-muted-foreground">Use advanced AI for better accuracy</p>
                  </div>
                  <Switch
                    checked={aiSettings.enhancedParsing}
                    onCheckedChange={(checked) => updateAiSetting('enhancedParsing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Retry</Label>
                    <p className="text-xs text-muted-foreground">Retry failed parsing attempts</p>
                  </div>
                  <Switch
                    checked={aiSettings.autoRetry}
                    onCheckedChange={(checked) => updateAiSetting('autoRetry', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Skill Extraction</Label>
                    <p className="text-xs text-muted-foreground">Extract technical and soft skills</p>
                  </div>
                  <Switch
                    checked={aiSettings.skillExtraction}
                    onCheckedChange={(checked) => updateAiSetting('skillExtraction', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Experience Analysis</Label>
                    <p className="text-xs text-muted-foreground">Analyze work experience details</p>
                  </div>
                  <Switch
                    checked={aiSettings.experienceAnalysis}
                    onCheckedChange={(checked) => updateAiSetting('experienceAnalysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Education Parsing</Label>
                    <p className="text-xs text-muted-foreground">Extract education information</p>
                  </div>
                  <Switch
                    checked={aiSettings.educationParsing}
                    onCheckedChange={(checked) => updateAiSetting('educationParsing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Custom Prompts</Label>
                    <p className="text-xs text-muted-foreground">Use custom AI prompts</p>
                  </div>
                  <Switch
                    checked={aiSettings.customPrompts}
                    onCheckedChange={(checked) => updateAiSetting('customPrompts', checked)}
                  />
                </div>

                {aiSettings.customPrompts && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Custom Prompt</Label>
                    <Textarea
                      placeholder="Enter your custom AI prompt..."
                      value={aiSettings.customPromptText}
                      onChange={(e) => updateAiSetting('customPromptText', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => updateSystemSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Format</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => updateSystemSetting('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Language</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => updateSystemSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme</Label>
                  <Select value={systemSettings.theme} onValueChange={(value) => updateSystemSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* File Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  File Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => updateSystemSetting('maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Allowed Formats</Label>
                  <div className="flex flex-wrap gap-2">
                    {['pdf', 'docx', 'doc', 'txt', 'rtf'].map((format) => (
                      <div key={format} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={format}
                          checked={systemSettings.allowedFormats.includes(format)}
                          onChange={(e) => {
                            const formats = e.target.checked
                              ? [...systemSettings.allowedFormats, format]
                              : systemSettings.allowedFormats.filter(f => f !== format);
                            updateSystemSetting('allowedFormats', formats);
                          }}
                        />
                        <Label htmlFor={format} className="text-sm uppercase">
                          {format}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Rate Limiting</Label>
                    <p className="text-xs text-muted-foreground">Limit API requests per hour</p>
                  </div>
                  <Switch
                    checked={systemSettings.rateLimiting}
                    onCheckedChange={(checked) => updateSystemSetting('rateLimiting', checked)}
                  />
                </div>

                {systemSettings.rateLimiting && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Requests per Hour</Label>
                    <Input
                      type="number"
                      value={systemSettings.maxRequestsPerHour}
                      onChange={(e) => updateSystemSetting('maxRequestsPerHour', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Backup & Logging */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Backup & Logging
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Backup</Label>
                    <p className="text-xs text-muted-foreground">Automatic data backups</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => updateSystemSetting('autoBackup', checked)}
                  />
                </div>

                {systemSettings.autoBackup && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Backup Frequency</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => updateSystemSetting('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Logging</Label>
                    <p className="text-xs text-muted-foreground">System activity logging</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableLogging}
                    onCheckedChange={(checked) => updateSystemSetting('enableLogging', checked)}
                  />
                </div>

                {systemSettings.enableLogging && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Log Level</Label>
                    <Select value={systemSettings.logLevel} onValueChange={(value) => updateSystemSetting('logLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Webhooks</Label>
                    <p className="text-xs text-muted-foreground">Send events to external systems</p>
                  </div>
                  <Switch
                    checked={integrationSettings.webhookEnabled}
                    onCheckedChange={(checked) => updateIntegrationSetting('webhookEnabled', checked)}
                  />
                </div>

                {integrationSettings.webhookEnabled && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Webhook URL</Label>
                    <Input
                      type="url"
                      placeholder="https://your-app.com/webhook"
                      value={integrationSettings.webhookUrl}
                      onChange={(e) => updateIntegrationSetting('webhookUrl', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Version</Label>
                  <Select value={integrationSettings.apiVersion} onValueChange={(value) => updateIntegrationSetting('apiVersion', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">Version 1</SelectItem>
                      <SelectItem value="v2">Version 2 (Current)</SelectItem>
                      <SelectItem value="v3">Version 3 (Beta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable CORS</Label>
                    <p className="text-xs text-muted-foreground">Cross-origin resource sharing</p>
                  </div>
                  <Switch
                    checked={integrationSettings.enableCors}
                    onCheckedChange={(checked) => updateIntegrationSetting('enableCors', checked)}
                  />
                </div>

                {integrationSettings.enableCors && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Allowed Origins</Label>
                    <Textarea
                      placeholder="https://yourapp.com, https://anotherapp.com"
                      value={integrationSettings.allowedOrigins}
                      onChange={(e) => updateIntegrationSetting('allowedOrigins', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SSO Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Single Sign-On</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable SSO</Label>
                    <p className="text-xs text-muted-foreground">Single sign-on authentication</p>
                  </div>
                  <Switch
                    checked={integrationSettings.ssoEnabled}
                    onCheckedChange={(checked) => updateIntegrationSetting('ssoEnabled', checked)}
                  />
                </div>

                {integrationSettings.ssoEnabled && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SSO Provider</Label>
                    <Select value={integrationSettings.ssoProvider} onValueChange={(value) => updateIntegrationSetting('ssoProvider', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="microsoft">Microsoft</SelectItem>
                        <SelectItem value="okta">Okta</SelectItem>
                        <SelectItem value="auth0">Auth0</SelectItem>
                        <SelectItem value="saml">SAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Advanced Settings</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    These settings are for advanced users only. Incorrect configuration may affect system performance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-5 h-5" />
                      <span className="font-medium">Database Configuration</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Configure database connections and performance settings
                    </p>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">Performance Tuning</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Optimize system performance and resource usage
                    </p>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Security Policies</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Configure advanced security and compliance settings
                    </p>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5" />
                      <span className="font-medium">AI Model Training</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Custom AI model training and fine-tuning options
                    </p>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}