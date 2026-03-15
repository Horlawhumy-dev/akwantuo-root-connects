import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store, Plus, Edit2, Trash2, Package, Eye, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Phone, Mail, MapPin, Truck, X, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SEOHead } from "@/components/SEOHead";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShopImageUpload, ProductImageUpload } from "@/components/shops/ShopImageUpload";

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending Review", color: "bg-primary/10 text-primary" },
  approved: { icon: <CheckCircle className="h-3.5 w-3.5" />, label: "Approved", color: "bg-kente-green/10 text-kente-green" },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-destructive/10 text-destructive" },
};

const deliveryLabels: Record<string, string> = {
  pickup: "Pickup Only", delivery: "Delivery Only", both: "Pickup & Delivery",
};

const countries = ["Ghana", "Senegal", "Nigeria", "Côte d'Ivoire", "Mali"];
const categoryOptions = [
  "general", "food & drink", "fashion & textiles", "arts & crafts",
  "beauty & wellness", "tours & experiences", "electronics", "home & living",
];

interface ProductDraft {
  id?: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  is_service: boolean;
  image_url: string | null;
}

export default function MyShops() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [expandedShop, setExpandedShop] = useState<string | null>(null);
  const [editShopId, setEditShopId] = useState<string | null>(null);
  const [editProductsShopId, setEditProductsShopId] = useState<string | null>(null);

  // Edit shop form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCountry, setEditCountry] = useState("Ghana");
  const [editRegion, setEditRegion] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editDelivery, setEditDelivery] = useState("both");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);

  // Product editing state
  const [productDrafts, setProductDrafts] = useState<ProductDraft[]>([]);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["my-shops", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*, shop_products(*)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Delete shop
  const deleteShop = useMutation({
    mutationFn: async (shopId: string) => {
      const { error: pe } = await supabase.from("shop_products").delete().eq("shop_id", shopId);
      if (pe) throw pe;
      const { error } = await supabase.from("shops").delete().eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shops"] });
      toast({ title: "Shop deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Update shop details
  const updateShop = useMutation({
    mutationFn: async () => {
      if (!editShopId) return;
      const { error } = await supabase.from("shops").update({
        name: editName,
        description: editDescription,
        country: editCountry,
        region: editRegion,
        category: editCategory,
        delivery_style: editDelivery as any,
        address: editAddress || null,
        phone: editPhone || null,
        email: editEmail || null,
        image_urls: editImageUrls.length > 0 ? editImageUrls : null,
      }).eq("id", editShopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shops"] });
      setEditShopId(null);
      toast({ title: "Shop updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Save products
  const saveProducts = useMutation({
    mutationFn: async () => {
      if (!editProductsShopId) return;
      // Delete removed products
      if (deletedProductIds.length > 0) {
        const { error } = await supabase.from("shop_products").delete().in("id", deletedProductIds);
        if (error) throw error;
      }
      // Upsert remaining
      for (const p of productDrafts) {
        if (!p.name.trim()) continue;
        const row = {
          shop_id: editProductsShopId,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price) || 0,
          currency: p.currency,
          is_service: p.is_service,
          image_url: p.image_url,
        };
        if (p.id) {
          const { error } = await supabase.from("shop_products").update(row).eq("id", p.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("shop_products").insert(row);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shops"] });
      setEditProductsShopId(null);
      toast({ title: "Products updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openEditShop = (shop: any) => {
    setEditShopId(shop.id);
    setEditName(shop.name);
    setEditDescription(shop.description);
    setEditCountry(shop.country);
    setEditRegion(shop.region);
    setEditCategory(shop.category);
    setEditDelivery(shop.delivery_style);
    setEditAddress(shop.address || "");
    setEditPhone(shop.phone || "");
    setEditEmail(shop.email || "");
    setEditImageUrls(shop.image_urls || []);
  };

  const openEditProducts = (shop: any) => {
    setEditProductsShopId(shop.id);
    setDeletedProductIds([]);
    setProductDrafts(
      (shop.shop_products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: String(p.price),
        currency: p.currency,
        is_service: p.is_service,
        image_url: p.image_url || null,
      }))
    );
  };

  if (authLoading) return null;

  return (
    <div>
      <SEOHead title="My Shops" description="Manage your marketplace listings, shop details, and products." />

      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Store className="h-3 w-3 mr-1" /> My Shops
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-foreground mb-2">
              My Shops
            </h1>
            <p className="text-charcoal-foreground/60">Manage your marketplace listings and products</p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 adinkra-bg">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-end mb-6">
            <Button asChild>
              <Link to="/marketplace/submit"><Plus className="h-4 w-4 mr-2" /> New Listing</Link>
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading your shops..." />
          ) : shops.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No Shops Yet</h2>
              <p className="text-muted-foreground mb-4">List your first shop to start selling.</p>
              <Button asChild>
                <Link to="/marketplace/submit"><Plus className="h-4 w-4 mr-2" /> List Your Shop</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {shops.map((shop: any) => {
                const sc = statusConfig[shop.status] || statusConfig.pending;
                const products = shop.shop_products || [];
                const isExpanded = expandedShop === shop.id;

                return (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {/* Header row */}
                    <div className="p-5 flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {shop.image_urls?.[0] ? (
                          <img src={shop.image_urls[0]} alt={shop.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display font-semibold">{shop.name}</h3>
                          <Badge className={`text-[10px] border-0 ${sc.color} flex items-center gap-1`}>
                            {sc.icon} {sc.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{shop.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{shop.region}, {shop.country}</span>
                          <span>{shop.category}</span>
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{products.length} products</span>
                          <span>{deliveryLabels[shop.delivery_style]}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditShop(shop)} title="Edit shop">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProducts(shop)} title="Manage products">
                          <Package className="h-3.5 w-3.5" />
                        </Button>
                        {shop.status === "approved" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View listing">
                            <Link to={`/marketplace/${shop.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete shop">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {shop.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete your shop and all its products. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteShop.mutate(shop.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedShop(isExpanded ? null : shop.id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded products preview */}
                    {isExpanded && (
                      <div className="border-t border-border px-5 py-4 bg-muted/30">
                        {products.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No products yet. <button className="text-primary underline" onClick={() => openEditProducts(shop)}>Add some</button></p>
                        ) : (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {products.map((p: any) => (
                              <div key={p.id} className="bg-card rounded-lg border border-border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  {p.is_service && <Badge variant="secondary" className="text-[10px]">Service</Badge>}
                                  <span className="font-medium text-sm truncate">{p.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                                <p className="font-display font-semibold text-primary text-sm mt-1">
                                  {p.currency} {Number(p.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Edit Shop Dialog */}
      <Dialog open={!!editShopId} onOpenChange={(open) => !open && setEditShopId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shop Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Shop Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Shop Photos</Label>
              <p className="text-xs text-muted-foreground mb-2">First image is the cover photo.</p>
              {user && <ShopImageUpload images={editImageUrls} onChange={setEditImageUrls} folder={user.id} max={5} />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Country</Label>
                <Select value={editCountry} onValueChange={setEditCountry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Region</Label>
                <Input value={editRegion} onChange={(e) => setEditRegion(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery</Label>
                <Select value={editDelivery} onValueChange={setEditDelivery}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup Only</SelectItem>
                    <SelectItem value="delivery">Delivery Only</SelectItem>
                    <SelectItem value="both">Pickup & Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => updateShop.mutate()} disabled={!editName || !editRegion || updateShop.isPending}>
              {updateShop.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Products Dialog */}
      <Dialog open={!!editProductsShopId} onOpenChange={(open) => !open && setEditProductsShopId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Products & Services</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {productDrafts.length === 0 && (
              <p className="text-sm text-muted-foreground">No products yet. Add your first one below.</p>
            )}
            {productDrafts.map((p, i) => (
              <div key={i} className="border border-border rounded-lg p-3 space-y-2 relative">
                <button
                  onClick={() => {
                    if (p.id) setDeletedProductIds((prev) => [...prev, p.id!]);
                    setProductDrafts((prev) => prev.filter((_, j) => j !== i));
                  }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="flex gap-3">
                  {user && (
                    <ProductImageUpload
                      image={p.image_url}
                      onChange={(url) => setProductDrafts((prev) => prev.map((x, j) => j === i ? { ...x, image_url: url } : x))}
                      folder={user.id}
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input value={p.name} onChange={(e) => setProductDrafts((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input type="number" value={p.price} onChange={(e) => setProductDrafts((prev) => prev.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input value={p.description} onChange={(e) => setProductDrafts((prev) => prev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={p.is_service} onCheckedChange={(v) => setProductDrafts((prev) => prev.map((x, j) => j === i ? { ...x, is_service: v } : x))} />
                  <Label className="text-xs">Service</Label>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setProductDrafts((prev) => [...prev, { name: "", description: "", price: "", currency: "GHS", is_service: false, image_url: null }])}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => saveProducts.mutate()} disabled={saveProducts.isPending}>
              {saveProducts.isPending ? "Saving..." : "Save Products"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
