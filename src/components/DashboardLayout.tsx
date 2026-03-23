import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface Props {
  children: ReactNode;
  title: string;
  /** Pass true on pages that want a functional search bar in the header */
  withSearch?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function DashboardLayout({
  children,
  title,
  onSearch,
  searchQuery,
}: Props) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          title={title}
          onSearch={onSearch}
          searchQuery={searchQuery}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
