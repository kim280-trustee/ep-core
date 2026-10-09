import { useEffect, useState } from "react";
import { AppRouter } from "@/app/router/AppRouter";
import { supabase } from "@/core/database";
import { storeContext } from "@/core/store/store.context";

function App() {
  const [contextReady, setContextReady] = useState(false);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadContext = async () => {
      const currentRequestId = ++requestId;
      storeContext.clearStore();

      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active || currentRequestId !== requestId) return;

        if (authError || !authUser) {
          storeContext.clearStore();
          setContextReady(true);
          return;
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("tenant_id")
          .eq("auth_user_id", authUser.id)
          .single();

        if (!active || currentRequestId !== requestId) return;

        if (error || !user) {
          storeContext.clearStore();
          setContextReady(true);
          return;
        }

        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id, name")
          .eq("id", user.tenant_id)
          .single();

        if (!active || currentRequestId !== requestId) return;

        if (tenantError || !tenant) {
          storeContext.clearStore();
          setContextReady(true);
          return;
        }

        storeContext.setStore({
          tenantId: tenant.id,
          storeId: tenant.id,
          name: tenant.name,
        });

        setContextReady(true);
      } catch {
        if (active && currentRequestId === requestId) {
          storeContext.clearStore();
          setContextReady(true);
        }
      }
    };

    void loadContext();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadContext();
    });

    return () => {
      active = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  if (!contextReady) {
    return null;
  }

  return <AppRouter />;
}

export default App;
