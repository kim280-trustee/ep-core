import { SuppliersPage } from "../pages/SuppliersPage";
import { CreateSupplierPage } from "../pages/CreateSupplierPage";
import { EditSupplierPage } from "../pages/EditSupplierPage";
import { SupplierPaymentsPage } from "../pages/SupplierPaymentsPage";
import { SupplierLedgerPage } from "../pages/SupplierLedgerPage";

export const supplierRoutes = [
  { path: "/suppliers", element: <SuppliersPage /> },
  { path: "/suppliers/create", element: <CreateSupplierPage /> },
  { path: "/suppliers/:id/edit", element: <EditSupplierPage /> },
  { path: "/suppliers/payments", element: <SupplierPaymentsPage /> },
  { path: "/suppliers/:id/ledger", element: <SupplierLedgerPage /> },
];
