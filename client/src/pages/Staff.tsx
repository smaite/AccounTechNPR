import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Edit, Trash2, UserCheck, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type User as StaffUser, type InsertUser } from "@shared/schema";

const roleOptions = [
  { value: "admin", label: "Administrator", description: "Full system access" },
  { value: "accountant", label: "Accountant", description: "Financial operations" },
  { value: "staff", label: "Staff", description: "Limited access" },
];

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingMember;

  const { data: staff = [], isLoading } = useQuery<StaffUser[]>({
    queryKey: ["/api/staff"],
  });

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      role: "staff",
      isActive: true,
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editingMember) {
      form.reset({
        username: editingMember.username,
        password: "", // Don't pre-fill password for security
        fullName: editingMember.fullName,
        email: editingMember.email,
        phone: editingMember.phone || "",
        role: editingMember.role,
        isActive: editingMember.isActive,
      });
      setIsDialogOpen(true);
    }
  }, [editingMember, form]);

  const staffMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/staff/${editingMember!.id}` : "/api/staff";
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ 
        title: "Success", 
        description: `Staff member ${isEditing ? 'updated' : 'added'} successfully` 
      });
      setIsDialogOpen(false);
      setEditingMember(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete staff member");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Success", description: "Staff member deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (member: StaffUser) => {
    setEditingMember(member);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const onSubmit = (data: InsertUser) => {
    staffMutation.mutate(data);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-destructive/10 text-destructive",
      accountant: "bg-primary/10 text-primary",
      staff: "bg-accent/10 text-accent"
    };
    return variants[role as keyof typeof variants] || variants.staff;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield;
      case "accountant":
        return UserCheck;
      default:
        return User;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const roleStats = roleOptions.map(role => {
    const count = staff.filter(member => member.role === role.value).length;
    const Icon = getRoleIcon(role.value);
    
    return {
      ...role,
      count,
      icon: Icon,
    };
  });

  return (
    <div className="p-6" data-testid="staff-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff roles, permissions, and access controls</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0" data-testid="button-add-staff">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm" data-testid="dialog-add-staff">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} data-testid="input-full-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} data-testid="input-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="staff@email.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+977-1-xxxxxxx" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-muted-foreground">{role.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingMember(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={staffMutation.isPending} data-testid="button-save-staff">
                    {staffMutation.isPending 
                      ? (isEditing ? "Updating..." : "Saving...") 
                      : (isEditing ? "Update Staff Member" : "Add Staff Member")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {roleStats.map((role) => {
          const Icon = role.icon;
          return (
            <Card 
              key={role.value} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setRoleFilter(roleFilter === role.value ? "all" : role.value)}
              data-testid={`card-role-${role.value}`}
            >
              <CardContent className="p-4 text-center">
                <Icon className="w-8 h-8 text-primary mb-2 mx-auto" />
                <p className="font-medium text-foreground">{role.label}</p>
                <p className="text-sm text-muted-foreground">{role.count} members</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Staff Table */}
      <Card data-testid="card-staff">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Staff Directory</CardTitle>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32" data-testid="select-role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No staff members found</p>
              <p className="text-sm">Add your first staff member to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Staff Member</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStaff.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    return (
                      <tr key={member.id} data-testid={`row-staff-${member.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <RoleIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{member.fullName}</p>
                              <p className="text-sm text-muted-foreground">@{member.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="text-foreground">{member.email}</p>
                            <p className="text-muted-foreground">{member.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getRoleBadge(member.role)}>
                            {roleOptions.find(r => r.value === member.role)?.label || member.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={member.isActive ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-800"}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEdit(member)}
                              data-testid={`button-edit-${member.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(member.id)}
                              data-testid={`button-delete-${member.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
