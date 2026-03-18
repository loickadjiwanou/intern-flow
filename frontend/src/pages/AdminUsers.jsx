import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Users, 
  Shield, 
  Search, 
  UserCog, 
  Mail, 
  Calendar,
  Building,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Crown,
  Briefcase,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const roleColors = {
  'Admin': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'HR': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'Manager': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Intern': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const roleIcons = {
  'Admin': Crown,
  'HR': UserCheck,
  'Manager': Briefcase,
  'Intern': GraduationCap,
};

const roleDescriptions = {
  'Admin': 'Full system access, can manage all users and settings',
  'HR': 'Can manage interns, tasks, evaluations and documents',
  'Manager': 'Can manage assigned interns and tasks',
  'Intern': 'Limited access to own profile and assigned tasks',
};

export default function AdminUsers() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    setIsUpdating(true);
    try {
      await usersAPI.updateRole(selectedUser._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await usersAPI.updateStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    hr: users.filter(u => u.role === 'HR').length,
    managers: users.filter(u => u.role === 'Manager').length,
    interns: users.filter(u => u.role === 'Intern').length,
    active: users.filter(u => u.isActive).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and access permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-brand-600" />
          <span className="text-sm font-medium text-muted-foreground">RBAC Admin</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <Users size={20} className="text-brand-600 dark:text-brand-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge className={`${roleColors['Admin']} border-0`}>
              <Crown size={14} className="mr-1" />
              Admin
            </Badge>
            <span className="text-xl font-bold text-foreground">{stats.admins}</span>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge className={`${roleColors['HR']} border-0`}>
              <UserCheck size={14} className="mr-1" />
              HR
            </Badge>
            <span className="text-xl font-bold text-foreground">{stats.hr}</span>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge className={`${roleColors['Manager']} border-0`}>
              <Briefcase size={14} className="mr-1" />
              Manager
            </Badge>
            <span className="text-xl font-bold text-foreground">{stats.managers}</span>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge className={`${roleColors['Intern']} border-0`}>
              <GraduationCap size={14} className="mr-1" />
              Intern
            </Badge>
            <span className="text-xl font-bold text-foreground">{stats.interns}</span>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
            data-testid="search-users-input"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]" data-testid="filter-role-select">
            <UserCog size={16} className="mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Intern">Intern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Role Permissions Info */}
      <Card className="bg-muted/30 dark:bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield size={16} />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(roleDescriptions).map(([role, description]) => {
              const Icon = roleIcons[role];
              return (
                <div key={role} className="flex items-start gap-2">
                  <Badge className={`${roleColors[role]} border-0 shrink-0`}>
                    <Icon size={12} className="mr-1" />
                    {role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  const isCurrentUser = user._id === currentUser?._id;
                  
                  return (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors" data-testid={`user-row-${user._id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-medium text-brand-600 dark:text-brand-300">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.firstName} {user.lastName}
                              {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.position || 'No position'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={14} />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${roleColors[user.role]} border-0`}>
                          <RoleIcon size={12} className="mr-1" />
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building size={14} />
                          <span className="text-sm">{user.department || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                              <CheckCircle size={12} className="mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">
                              <XCircle size={12} className="mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isCurrentUser} data-testid={`user-actions-${user._id}`}>
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                              <UserCog size={14} className="mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusToggle(user._id, user.isActive)}
                              className={user.isActive ? 'text-red-600' : 'text-green-600'}
                            >
                              {user.isActive ? (
                                <>
                                  <XCircle size={14} className="mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} className="mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-lg font-medium text-brand-600 dark:text-brand-300">
                {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            
            <div>
              <Label>Current Role</Label>
              <div className="mt-1">
                <Badge className={`${roleColors[selectedUser?.role]} border-0`}>
                  {selectedUser?.role}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1" data-testid="new-role-select">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleDescriptions).map(([role, description]) => {
                    const Icon = roleIcons[role];
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Icon size={14} />
                          <span>{role}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {newRole && (
                <p className="text-xs text-muted-foreground mt-2">
                  {roleDescriptions[newRole]}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange}
              disabled={isUpdating || !newRole || newRole === selectedUser?.role}
              className="bg-brand-600 hover:bg-brand-700"
              data-testid="confirm-role-change"
            >
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
