import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PageRow {
  id: string;
  page_slug: string;
  page_label: string;
  enabled: boolean;
}

export default function AdminPages() {
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-page-visibility"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_visibility")
        .select("*")
        .order("page_label");
      if (error) throw error;
      return data as PageRow[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("page_visibility")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-visibility"] });
      queryClient.invalidateQueries({ queryKey: ["page-visibility"] });
      toast.success("Page visibility updated");
    },
    onError: () => {
      toast.error("Failed to update page visibility");
    },
  });

  return (
    <AdminLayout title="Page Management" description="Enable or disable public-facing pages">
      <div className="bg-card rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Toggle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-5 w-16 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-5 w-10 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.page_label}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    /{page.page_slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.enabled ? "default" : "secondary"}>
                      {page.enabled ? "Live" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={page.enabled}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: page.id, enabled: checked })
                      }
                      disabled={toggleMutation.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
