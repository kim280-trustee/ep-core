import type {
  ReactNode,
} from "react";

import {
  Header,
} from "./Header";

import {
  Sidebar,
} from "./Sidebar";

interface Props {
  children: ReactNode;
}

export function AppLayout({
  children,
}: Props) {
  return (
    <div>
      <Sidebar />

      <div>
        <Header />

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}