import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ShopImageUpload, ProductImageUpload } from "@/components/shops/ShopImageUpload";

const countries = ["Ghana", "Senegal", "Nigeria", "Côte d'Ivoire", "Mali", "Benin", "Togo"];
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
  _deleted?: boolean;
}

export default function EditShop() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("general");
  const [deliveryStyle, setDeliveryStyle] = useState("both");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductDraft[]>([]);

  const { data: shop, isLoading } = useQuery({
    queryKey: ["edit-shop", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*, shop_products(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!shop) return;
    if (user && shop.owner_id !== user.id) {
      navigate("/marketplace/my-shops");
      return;
    }
    setName(shop.name);
    setDescription(shop.description);
    setCountry(shop.country);
    setRegion(shop.region);
    setCategory(shop.category);
    setDeliveryStyle(shop.delivery_style);
    setAddress(shop.address || "");
    setPhone(shop.phone || "");
    setEmail(shop.email || "");
    setImageUrls(shop.image_urls || []);
    setProducts(
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
  }, [shop, user, navigate]);

  const addProduct = () => {
    setProducts([...products, { name: "", description: "", price: "", currency: "GHS", is_service: false, image_url: null }]);
  };

  const updateProduct = (index: number, field: keyof ProductDraft, value: string | boolean | null) => {
    setProducts(products.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removeProduct = (index: number) => {
    const p = products[index];
    if (p.id) {
      setProducts(products.map((pr, i) => i === index ? { ...pr, _deleted: true } : pr));
    } else {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!user || !id || !name || !region) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("shops").update({
        name,
        description,
        country,
        region,
        category,
        delivery_style: deliveryStyle as any,
        address: address || null,
        phone: phone || null,
        email: email || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      }).eq("id", id);
      if (error) throw error;

      // Handle deleted products
      const deletedIds = products.filter(p => p._deleted && p.id).map(p => p.id!);
      if (deletedIds.length > 0) {
        await supabase.from("shop_products").delete().in("id", deletedIds);
      }

      // Upsert products
      for (const p of products.filter(pr => !pr._deleted && pr.name.trim())) {
        const row = {
          shop_id: id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price) || 0,
          currency: p.currency,
          is_service: p.is_service,
          image_url: p.image_url,
        };
        if (p.id) {
          await supabase.from("shop_products").update(row).eq("id", p.id);
        } else {
          await supabase.from("shop_products").insert(row);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["my-shops"] });
      toast({ title: "Shop updated!", description: "Your changes have been saved." });
      navigate("/marketplace/my-shops");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isLoading) return <LoadingSpinner message="Loading shop..." />;

  if (!shop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Shop not found</p>
        <Button asChild variant="outline"><Link to="/marketplace/my-shops">My Shops</Link></Button>
      </div>
    );
  }

  const visibleProducts = products.filter(p => !p._deleted);

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" className="text-charcoal-foreground/60 mb-4" asChild>
            <Link to="/marketplace/my-shops"><ArrowLeft className="h-4 w-4 mr-1" /> My Shops</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Store className="h-3 w-3 mr-1" /> Edit Listing
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">Edit {shop.name}</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-10 adinkra-bg">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            {/* Shop Details */}
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-lg">Shop Details</h2>
              <div>
                <Label>Shop Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Shop Photos</Label>
                <p className="text-xs text-muted-foreground mb-2">First image is the cover photo.</p>
                {user && <ShopImageUpload images={imageUrls} onChange={setImageUrls} folder={user.id} max={5} />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Region *</Label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categoryOptions.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delivery Style</Label>
                  <Select value={deliveryStyle} onValueChange={setDeliveryStyle}>
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
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">Products & Services</h2>
                <Button variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              {visibleProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">No products yet. Add some above.</p>
              )}

              {products.map((product, i) => {
                if (product._deleted) return null;
                return (
                  <div key={product.id || i} className="border border-border rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => removeProduct(i)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="flex gap-3">
                      {user && (
                        <ProductImageUpload
                          image={product.image_url}
                          onChange={(url) => updateProduct(i, "image_url", url)}
                          folder={user.id}
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={product.name} onChange={(e) => updateProduct(i, "name", e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-xs">Price</Label>
                            <Input type="number" value={product.price} onChange={(e) => updateProduct(i, "price", e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input value={product.description} onChange={(e) => updateProduct(i, "description", e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={product.is_service} onCheckedChange={(v) => updateProduct(i, "is_service", v)} />
                      <Label className="text-xs">This is a service</Label>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={handleSave} disabled={!name || !region || saving} className="w-full" size="lg">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
