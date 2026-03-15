import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShopImageUpload, ProductImageUpload } from "@/components/shops/ShopImageUpload";

const countries = ["Ghana", "Senegal", "Nigeria", "Côte d'Ivoire", "Mali"];
const categoryOptions = [
  "general", "food & drink", "fashion & textiles", "arts & crafts",
  "beauty & wellness", "tours & experiences", "electronics", "home & living",
];

interface ProductDraft {
  name: string;
  description: string;
  price: string;
  currency: string;
  is_service: boolean;
  image_url: string | null;
}

export default function SubmitShop() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const addProduct = () => {
    setProducts([...products, { name: "", description: "", price: "", currency: "GHS", is_service: false, image_url: null }]);
  };

  const updateProduct = (index: number, field: keyof ProductDraft, value: string | boolean | null) => {
    setProducts(products.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !name || !region) return;
    setLoading(true);
    try {
      const { data: shop, error } = await supabase.from("shops").insert({
        owner_id: user.id,
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
      }).select().single();
      if (error) throw error;

      const validProducts = products.filter(p => p.name.trim());
      if (validProducts.length > 0) {
        const { error: prodError } = await supabase.from("shop_products").insert(
          validProducts.map(p => ({
            shop_id: shop.id,
            name: p.name,
            description: p.description,
            price: parseFloat(p.price) || 0,
            currency: p.currency,
            is_service: p.is_service,
            image_url: p.image_url,
          }))
        );
        if (prodError) throw prodError;
      }

      toast({ title: "Shop submitted!", description: "Your listing is pending review." });
      navigate("/marketplace/my-shops");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Store className="h-3 w-3 mr-1" /> New Listing
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">List Your Shop</h1>
            <p className="text-charcoal-foreground/60 mt-1">Share your business with travelers across West Africa</p>
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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Auntie Ama's Kente Weaving" />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell customers about your shop..." />
              </div>

              {/* Shop Images */}
              <div>
                <Label>Shop Photos</Label>
                <p className="text-xs text-muted-foreground mb-2">Add up to 5 photos. First image will be your cover photo.</p>
                {user && <ShopImageUpload images={imageUrls} onChange={setImageUrls} folder={user.id} max={5} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Region *</Label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Greater Accra" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                    </SelectContent>
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
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Oxford Street, Osu" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 XX XXX XXXX" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="shop@email.com" type="email" />
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

              {products.length === 0 && (
                <p className="text-sm text-muted-foreground">Add your products or services below. You can also add them later.</p>
              )}

              {products.map((product, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
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
                          <Input value={product.name} onChange={(e) => updateProduct(i, "name", e.target.value)} placeholder="Product name" />
                        </div>
                        <div>
                          <Label className="text-xs">Price</Label>
                          <Input type="number" value={product.price} onChange={(e) => updateProduct(i, "price", e.target.value)} placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input value={product.description} onChange={(e) => updateProduct(i, "description", e.target.value)} placeholder="Brief description" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={product.is_service} onCheckedChange={(v) => updateProduct(i, "is_service", v)} />
                    <Label className="text-xs">This is a service (not a physical product)</Label>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={!name || !region || loading} className="w-full" size="lg">
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
