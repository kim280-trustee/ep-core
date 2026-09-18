import { useEffect,useMemo,useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useCategoriesStore } from "@/features/categories/store/categories.store";
import { useBrandsStore } from "@/features/brands/store/brands.store";
import { useUnitsStore } from "@/features/units/store/units.store";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import { storeContext } from "@/core/store/store.context";
import { productService } from "../services/product.service";
import { buildPreview,downloadTemplate,normalizeImportedRows,parseProductFile,toCreateInput,type ImportPreviewRow } from "../utils/product-import.utils";
import type { Product } from "../types/product.types";

export function ProductImportPage(){
  const {user}=useAuth();
  const tenantId=user?.tenantId??"";
  const [existing,setExisting]=useState<Product[]>([]);const [mode,setMode]=useState<"catalog"|"supplier">("catalog");const [preview,setPreview]=useState<ImportPreviewRow[]>([]);const [fileName,setFileName]=useState("");const [loading,setLoading]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
  const storeId=storeContext.getStore()?.storeId??null;const currency=useSettingsStore(s=>s.settings?.currency??"THB");
  useEffect(() => {
    if (!tenantId) return;
    void useSettingsStore.getState().loadSettings(tenantId);
    void productService.getProducts(tenantId, {}).then((result) => setExisting(result.data)).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load existing products."));
  }, [tenantId]);
  const stats=useMemo(()=>({total:preview.length,valid:preview.filter(r=>!r.error).length,matched:preview.filter(r=>!r.error&&r.match).length,newProducts:preview.filter(r=>!r.error&&!r.match).length,errors:preview.filter(r=>Boolean(r.error)).length}),[preview]);
  async function handleFile(file?:File){if(!file)return;setLoading(true);setError("");setMessage("");setFileName(file.name);try{setPreview(buildPreview(normalizeImportedRows(await parseProductFile(file)),existing));}catch(e){setPreview([]);setError(e instanceof Error?e.message:"Could not read the file.");}finally{setLoading(false);}}
  async function importProducts(){
    setLoading(true);setError("");setMessage("");
    try{
      if(!tenantId)throw new Error("Tenant is required.");if(stats.errors)throw new Error("Fix the invalid rows before importing.");
      if(mode==="supplier"){setMessage(`Supplier list analysed: ${stats.matched} existing products and ${stats.newProducts} new products detected. Existing products are ready to be matched into a purchase workflow.`);return;}
      const categoryMap=new Map(useCategoriesStore.getState().categories.filter(x=>x.status==="active").map(x=>[x.name.trim().toLowerCase(),x.id]));
      const brandMap=new Map(useBrandsStore.getState().brands.filter(x=>x.status==="active").map(x=>[x.name.trim().toLowerCase(),x.id]));
      const unitMap=new Map(useUnitsStore.getState().units.filter(x=>x.status==="active").map(x=>[x.name.trim().toLowerCase(),x.id]));
      const inputs=[];
      for(const row of preview.filter(x=>!x.error&&!x.match)){
        let categoryId=row.category?categoryMap.get(row.category.trim().toLowerCase()):undefined;
        if(row.category&&!categoryId){await createCategory({name:row.category.trim()},tenantId,storeId??"");categoryId=useCategoriesStore.getState().categories.find(x=>x.status==="active"&&x.name.trim().toLowerCase()===row.category!.trim().toLowerCase())?.id;if(categoryId)categoryMap.set(row.category.trim().toLowerCase(),categoryId);}
        let brandId=row.brand?brandMap.get(row.brand.trim().toLowerCase()):undefined;
        if(row.brand&&!brandId){await createBrand({name:row.brand.trim()},tenantId,storeId??"");brandId=useBrandsStore.getState().brands.find(x=>x.status==="active"&&x.name.trim().toLowerCase()===row.brand!.trim().toLowerCase())?.id;if(brandId)brandMap.set(row.brand.trim().toLowerCase(),brandId);}
        let unitId=row.unit?unitMap.get(row.unit.trim().toLowerCase()):undefined;
        if(row.unit&&!unitId){const symbol=row.unitSymbol||row.unit.trim().toLowerCase().replace(/\s+/g,"").slice(0,8)||"pcs";await createUnit({name:row.unit.trim(),symbol});unitId=useUnitsStore.getState().units.find(x=>x.status==="active"&&x.name.trim().toLowerCase()===row.unit!.trim().toLowerCase())?.id;if(unitId)unitMap.set(row.unit.trim().toLowerCase(),unitId);}
        if(!unitId)unitId=useUnitsStore.getState().units.find(x=>x.status==="active")?.id;if(!unitId)throw new Error(`Row ${row.rowNumber}: create a unit before importing products.`);
        inputs.push(toCreateInput(row,tenantId,storeId,currency,unitId,categoryId,brandId));
      }
      if(!inputs.length){setMessage("No new products need to be imported. Existing matches were skipped.");return;}
      const created=await productService.createProducts(inputs);setMessage(`Imported ${created.length} products successfully. Existing matches were skipped.`);
      const refreshed=await productService.getProducts(tenantId, {});setExisting(refreshed.data);
    }catch(e){setError(e instanceof Error?e.message:"Import failed.");}finally{setLoading(false);}
  }
  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">Product Import</h1><p className="text-sm text-gray-500">Import a catalog or analyse a supplier product list without retyping every item.</p></div><div className="flex flex-wrap gap-2"><Link to="/products" className="rounded-lg border px-4 py-2">Back to Products</Link><button type="button" onClick={downloadTemplate} className="rounded-lg border px-4 py-2">Download Template</button></div></div>
    <div className="rounded-xl border bg-white p-5"><div className="mb-4 flex gap-2"><button type="button" onClick={()=>setMode("catalog")} className={`rounded-lg px-4 py-2 ${mode==="catalog"?"bg-blue-600 text-white":"border"}`}>Product Catalog</button><button type="button" onClick={()=>setMode("supplier")} className={`rounded-lg px-4 py-2 ${mode==="supplier"?"bg-blue-600 text-white":"border"}`}>Supplier List</button></div><label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center"><span className="font-medium">Upload CSV file</span><span className="mt-1 text-sm text-gray-500">Existing products are matched before new products are created.</span><input type="file" accept=".csv" className="mt-4" onChange={e=>void handleFile(e.target.files?.[0])}/></label>{fileName&&<p className="mt-3 text-sm text-gray-600">File: {fileName}</p>}</div>
    {loading&&<div className="rounded-xl border bg-white p-5">Processing...</div>}
    {preview.length>0&&<><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["Rows",stats.total],["Valid",stats.valid],["Existing",stats.matched],["New",stats.newProducts],["Errors",stats.errors]].map(([label,value])=><div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>)}</div>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead className="border-b bg-gray-50"><tr><th className="px-3 py-2 text-left">Row</th><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-left">Barcode</th><th className="px-3 py-2 text-left">Match</th><th className="px-3 py-2 text-left">Result</th></tr></thead><tbody>{preview.slice(0,50).map(row=><tr key={row.rowNumber} className="border-b"><td className="px-3 py-2">{row.rowNumber}</td><td className="px-3 py-2">{row.name||"-"}</td><td className="px-3 py-2">{row.sku}</td><td className="px-3 py-2">{row.barcode||"-"}</td><td className="px-3 py-2">{row.match?`Existing: ${row.match.name}`:"New product"}</td><td className="px-3 py-2">{row.error||"Ready"}</td></tr>)}</tbody></table></div>
      {stats.total>50&&<p className="text-sm text-gray-500">Showing the first 50 rows of {stats.total}.</p>}<button type="button" onClick={()=>void importProducts()} disabled={loading||Boolean(stats.errors)} className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50">{mode==="catalog"?"Import New Products":"Analyse Supplier List"}</button></>}
    {message&&<div className="rounded-xl border bg-green-50 p-4 text-green-800">{message}</div>}{error&&<div className="rounded-xl border bg-red-50 p-4 text-red-800">{error}</div>}</div>;
}
