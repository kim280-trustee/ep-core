import { useEffect,useMemo,useState } from "react";
import { useCreateProduct } from "../hooks/useProductMutations";
import { useUnits } from "@/features/units";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import { storeContext } from "@/core/store/store.context";
import type { Product } from "../types/product.types";

interface QuickProductFormProps{tenantId:string;onCreated?:(product:Product)=>void;}
const makeSku=(name:string)=>`QK-${name.trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,30)||"PRODUCT"}-${Date.now().toString().slice(-6)}`;

export function QuickProductForm({tenantId,onCreated}:QuickProductFormProps){
  const [name,setName]=useState("");const [sellingPrice,setSellingPrice]=useState("");const [costPrice,setCostPrice]=useState("");const [unitId,setUnitId]=useState("");const [error,setError]=useState("");
  const createProduct=useCreateProduct(tenantId);const {units}=useUnits();
  useEffect(()=>{if(tenantId)useSettingsStore.getState().loadSettings(tenantId);if(!unitId&&units.length)setUnitId(units.find(u=>u.status==="active")?.id??"");},[tenantId,units,unitId]);
  const currency=useSettingsStore(s=>s.settings?.currency??"THB");const activeUnits=useMemo(()=>units.filter(u=>u.status==="active"),[units]);
  async function submit(){
    const clean=name.trim();const price=Number(sellingPrice);const cost=costPrice.trim()?Number(costPrice):0;const storeId=storeContext.getStore()?.storeId??undefined;
    if(clean.length<2)return setError("Enter a product name.");if(!Number.isFinite(price)||price<0)return setError("Enter a valid selling price.");if(!unitId)return setError("Create or select a unit first.");
    try{const product=await createProduct.mutateAsync({tenantId,storeId,name:clean,sku:makeSku(clean),costPrice:Number.isFinite(cost)&&cost>=0?cost:0,sellingPrice:price,unitId,currency,trackInventory:true});
      setName("");setSellingPrice("");setCostPrice("");setError("");onCreated?.(product);
    }catch(e){setError(e instanceof Error?e.message:"Could not create product.");}
  }
  return <div className="rounded-xl border bg-white p-5"><div className="mb-4"><h2 className="text-lg font-semibold">Quick Add Product</h2><p className="text-sm text-gray-500">Start selling with only the information you have. Add the full profile later.</p></div>
    <div className="grid gap-3 md:grid-cols-4"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Product name" className="rounded-lg border p-2"/>
      <input value={sellingPrice} onChange={e=>setSellingPrice(e.target.value)} type="number" min="0" step="0.01" placeholder={`Selling price (${currency})`} className="rounded-lg border p-2"/>
      <input value={costPrice} onChange={e=>setCostPrice(e.target.value)} type="number" min="0" step="0.01" placeholder={`Cost price (${currency}) optional`} className="rounded-lg border p-2"/>
      <select value={unitId} onChange={e=>setUnitId(e.target.value)} className="rounded-lg border p-2"><option value="">Select unit</option>{activeUnits.map(u=><option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}</select></div>
    {error&&<p className="mt-2 text-sm text-red-600">{error}</p>}<button type="button" onClick={()=>void submit()} disabled={createProduct.isPending} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{createProduct.isPending?"Adding...":"Add Product"}</button></div>;
}