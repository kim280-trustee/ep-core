import * as XLSX from "xlsx";
import type { CreateProductInput, Product } from "../types/product.types";
import { ProductStatus, ProductType } from "../types/product.types";

export interface ImportedProductRow {
  rowNumber:number; name:string; sku:string; barcode?:string; category?:string; brand?:string; unit?:string; unitSymbol?:string;
  costPrice:number; sellingPrice:number; description?:string; trackInventory:boolean;
}
export interface ImportPreviewRow extends ImportedProductRow { match:Product|null; error?:string; }

const aliases:Record<string,string>={
  product:"name",productname:"name","product name":"name",name:"name",sku:"sku",code:"sku",barcode:"barcode",
  category:"category",brand:"brand",unit:"unit",units:"unit",unitsymbol:"unitSymbol","unit symbol":"unitSymbol",
  cost:"costPrice",costprice:"costPrice","cost price":"costPrice",selling:"sellingPrice",price:"sellingPrice",
  sellingprice:"sellingPrice","selling price":"sellingPrice",description:"description",inventory:"trackInventory",
  trackinventory:"trackInventory","track inventory":"trackInventory",
};
const text=(v:unknown)=>String(v??"").trim();
const key=(v:unknown)=>text(v).toLowerCase().replace(/[^a-z0-9]+/g,"");
const header=(v:unknown)=>text(v).toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ");
const num=(v:unknown)=>{const n=Number(text(v).replace(/,/g,""));return Number.isFinite(n)?n:0;};
const bool=(v:unknown)=>{const x=text(v).toLowerCase();return !x||!["false","0","no","n","inactive"].includes(x);};
const sku=(name:string,row:number)=>`IMP-${text(name).toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,36)||"PRODUCT"-${String(row).padStart(4,"0")}`;

export async function parseProductFile(file:File):Promise<Record<string,unknown>[]>{
  const workbook=XLSX.read(await file.arrayBuffer(),{cellDates:false});
  const sheet=workbook.Sheets[workbook.SheetNames[0]];
  if(!sheet) throw new Error("The uploaded file does not contain a worksheet.");
  return XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:""});
}
export function normalizeImportedRows(raw:Record<string,unknown>[]):ImportedProductRow[]{
  return raw.map((row,index)=>{
    const mapped:Record<string,unknown>={};
    for(const [k,v] of Object.entries(row)){const target=aliases[header(k)]??aliases[key(k)];if(target)mapped[target]=v;}
    const name=text(mapped.name);
    return {
      rowNumber:index+2,name,sku:text(mapped.sku)||sku(name,index+2),barcode:text(mapped.barcode)||undefined,
      category:text(mapped.category)||undefined,brand:text(mapped.brand)||undefined,unit:text(mapped.unit)||undefined,
      unitSymbol:text(mapped.unitSymbol)||undefined,costPrice:num(mapped.costPrice),sellingPrice:num(mapped.sellingPrice),
      description:text(mapped.description)||undefined,trackInventory:bool(mapped.trackInventory),
    };
  });
}
export function buildPreview(rows:ImportedProductRow,existing:Product[]):ImportPreviewRow[];
export function buildPreview(rows:ImportedProductRow[],existing:Product[]):ImportPreviewRow[]{
  const bySku=new Map(existing.map(p=>[key(p.sku),p]));
  const byBarcode=new Map(existing.filter(p=>p.barcode).map(p=>[key(p.barcode),p]));
  const byName=new Map(existing.map(p=>[key(p.name),p]));
  return rows.map(row=>{
    if(!row.name)return {...row,match:null,error:"Product name is required."};
    if(row.costPrice<0||row.sellingPrice<0)return {...row,match:null,error:"Prices cannot be negative."};
    const match=row.barcode?(byBarcode.get(key(row.barcode))??bySku.get(key(row.sku))??byName.get(key(row.name))??null):(bySku.get(key(row.sku))??byName.get(key(row.name))??null);
    return {...row,match};
  });
}
export function toCreateInput(row:ImportedProductRow,tenantId:string,storeId:string|null,currency:string,unitId:string,categoryId?:string,brandId?:string):CreateProductInput{
  return {tenantId,storeId:storeId||undefined,name:row.name,sku:row.sku,barcode:row.barcode,description:row.description,categoryId,brandId,unitId,
    productType:ProductType.PRODUCT,status:ProductStatus.ACTIVE,costPrice:row.costPrice,sellingPrice:row.sellingPrice,currency,trackInventory:row.trackInventory};
}
export function downloadTemplate():void{
  const sheet=XLSX.utils.json_to_sheet([{"Product Name":"Mama Tom Yum 55g",SKU:"MAMA-TY-55",Barcode:"8851876001012",Category:"Instant Noodles",Brand:"Mama",Unit:"Piece","Unit Symbol":"pcs","Cost Price":6,"Selling Price":8,Description:"Mama Tom Yum instant noodles 55g","Track Inventory":true}]);
  const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,sheet,"Products");XLSX.writeFile(workbook,"ep-product-import-template.xlsx");
}