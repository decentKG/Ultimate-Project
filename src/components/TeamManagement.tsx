import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  Eye,
  Settings,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  joinedDate: Date;
  permissions: string[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Tawanda Moyo',
      email: 'tawanda.moyo@company.com',
      role: 'admin',
      status: 'active',
      lastActive: new Date('2025-01-16T10:30:00'),
      joinedDate: new Date('2023-06-15'),
      permissions: ['all'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Nyasha Chikafu',
      email: 'nyasha.chikafu@company.com',
      role: 'manager',
      status: 'active',
      lastActive: new Date('2025-01-16T09:15:00'),
      joinedDate: new Date('2023-08-20'),
      permissions: ['read', 'write', 'export'],
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Ruvimbo Dube',
      email: 'ruvimbo.dube@company.com',
      role: 'analyst',
      status: 'active',
      lastActive: new Date('2025-01-15T16:45:00'),
      joinedDate: new Date('2023-11-10'),
      permissions: ['read', 'export'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'Tapiwa Mutsvairo',
      email: 'tapiwa.mutsvairo@company.com',
      role: 'viewer',
      status: 'pending',
      lastActive: new Date('2025-01-10T14:20:00'),
      joinedDate: new Date('2024-01-15'),
      permissions: ['read']
    }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      permissions: ['all'],
      color: 'bg-red-500'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Can manage resumes, export data, and view analytics',
      permissions: ['read', 'write', 'export', 'analytics'],
      color: 'bg-blue-500'
    },
    {
      id: 'analyst',
      name: 'Analyst',
      description: 'Can view and export resume data for analysis',
      permissions: ['read', 'export', 'analytics'],
      color: 'bg-green-500'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to resume data',
      permissions: ['read'],
      color: 'bg-gray-500'
    }
  ]);

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer',
    message: ''
  });

  const { toast } = useToast();

  const handleInvite = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteForm.email.split('@')[0],
      email: inviteForm.email,
      role: inviteForm.role as any,
      status: 'pending',
      lastActive: new Date(),
      joinedDate: new Date(),
      permissions: roles.find(r => r.id === inviteForm.role)?.permissions || ['read']
    };

    setTeamMembers(prev => [...prev, newMember]);
    setShowInviteDialog(false);
    setInviteForm({ email: '', role: 'viewer', message: '' });
    
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteForm.email}`
    });
  };

  const updateMemberRole = (memberId: string, newRole: string) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { 
            ...member, 
            role: newRole as any,
            permissions: roles.find(r => r.id === newRole)?.permissions || ['read']
          }
        : member
    ));
    
    toast({
      title: "Role updated",
      description: "Team member role has been updated successfully"
    });
  };

  const removeMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast({
      title: "Member removed",
      description: "Team member has been removed from the organization"
    });
  };

  const getRoleInfo = (roleId: string) => {
    return roles.find(r => r.id === roleId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Team Management
          </h2>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions for your organization
          </p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                          <span>{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Input
                  id="message"
                  placeholder="Welcome to our team!"
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteForm.email}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Overview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const roleInfo = getRoleInfo(member.role);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{member.name}</h4>
                            {member.role === 'admin' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${roleInfo?.color.replace('bg-', 'text-').replace('500', '600')}`}
                            >
                              {roleInfo?.name}
                            </Badge>
                            <span className={`text-xs ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <div>Last active</div>
                          <div>{member.lastActive.toLocaleDateString()}</div>
                        </div>
                        
                        <Select
                          value={member.role}
                          onValueChange={(value) => updateMemberRole(member.id, value)}
                          disabled={member.id === '1'} // Prevent changing admin role
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                          disabled={member.id === '1'} // Prevent removing admin
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles & Permissions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                      <h4 className="font-medium text-sm">{role.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Team Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Active Members</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending Invites</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Administrators</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.role === 'admin').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Managers</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.role === 'manager').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}