import { useEffect, useState } from "react";
import { AppRouter } from "@/app/router/AppRouter";
import { supabase } from "@/core/database";
import { storeContext } from "@/core/store/store.context";

function App() {
  const [contextReady, setContextReady] = useState(false);

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      setContextReady(false);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        storeContext.clearStore();
        if (active) setContextReady(true);
        return;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("auth_user_id", authUser.id)
        .single();

      if (error || !user) {
        storeContext.clearStore();
        if (active) setContextReady(true);
        return;
      }

      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id, name")
        .eq("id", user.tenant_id)
        .single();

      if (tenantError || !tenant) {
        storeContext.clearStore();
        if (active) setContextReady(true);
        return;
      }

      storeContext.setStore({
        tenantId: tenant.id,
        storeId: tenant.id,
        name: tenant.name,
      });

      if (active) setContextReady(true);
    };

    void loadContext();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadContext();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!contextReady) {
    return null;
  }

  return <AppRouter />;
}

export default App;
