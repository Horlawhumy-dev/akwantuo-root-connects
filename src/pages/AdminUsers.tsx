import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, UserCheck, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  moderator: "bg-primary/10 text-primary",
  user: "bg-muted text-muted-foreground",
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newRoleUserId, setNewRoleUserId] = useState("");
  const [newRole, setNewRole] = useState<string>("user");

  // Fetch all profiles with their roles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profileError) throw profileError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      if (rolesError) throw rolesError;

      return (profileData || []).map((p: any) => ({
        ...p,
        roles: (rolesData || []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
        roleEntries: (rolesData || []).filter((r: any) => r.user_id === p.user_id),
      }));
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role added" });
      setNewRoleUserId("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role removed" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = profiles.filter((p: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.display_name?.toLowerCase().includes(q) ||
      p.user_id?.toLowerCase().includes(q) ||
      p.roles?.some((r: string) => r.includes(q))
    );
  });

  return (
    <AdminLayout title="Users & Roles" description="Manage user accounts and role assignments">
      {/* Search + Add Role */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading users...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((profile: any) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm">
                    {profile.display_name || "Unnamed User"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono truncate">{profile.user_id}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {profile.roles.length === 0 ? (
                      <Badge variant="secondary" className="text-[10px]">No roles</Badge>
                    ) : (
                      profile.roleEntries.map((re: any) => (
                        <div key={re.id} className="flex items-center gap-1">
                          <Badge className={`text-[10px] border-0 ${roleColors[re.role] || roleColors.user}`}>
                            {re.role === "admin" && <Shield className="h-3 w-3 mr-0.5" />}
                            {re.role === "moderator" && <UserCheck className="h-3 w-3 mr-0.5" />}
                            {re.role}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="h-4 w-4 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove {re.role} role?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the {re.role} role from {profile.display_name || "this user"}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => removeRole.mutate(re.id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {newRoleUserId === profile.user_id ? (
                    <div className="flex items-center gap-2">
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => addRole.mutate({ userId: profile.user_id, role: newRole })}
                        disabled={profile.roles.includes(newRole)}
                      >
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setNewRoleUserId("")}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setNewRoleUserId(profile.user_id); setNewRole("user"); }}
                    >
                      <Shield className="h-3.5 w-3.5 mr-1" /> Assign Role
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
