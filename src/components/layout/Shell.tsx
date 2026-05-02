"use client";

import { ChevronRight, Menu, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUrlSync } from "@/hooks/use-url-sync";
import { cn } from "@/lib/utils";
import { QuoteBuilder } from "../quotes/QuoteBuilder";
import { ReceiptPanel } from "../receipt/ReceiptPanel";
import { ProjectSidebar } from "./ProjectSidebar";

export function Shell() {
  useUrlSync();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"quote" | "receipt">("quote");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-muted/30 flex-col">
        <ProjectSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-72">
              <ProjectSidebar />
            </SheetContent>
          </Sheet>

          <span className="font-bold text-sm tracking-tight">QUOTABLE</span>

          <Button variant="ghost" size="icon" onClick={() => setActiveTab(activeTab === "quote" ? "receipt" : "quote")}>
            {activeTab === "quote" ? <Receipt className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-hidden flex">
          {/* Quote Builder (Always visible on large, toggle on mobile) */}
          <div
            className={cn(
              "flex-1 h-full overflow-y-auto transition-all duration-300",
              activeTab === "receipt" ? "hidden lg:block" : "block",
            )}
          >
            <QuoteBuilder />
          </div>

          {/* Receipt Panel (Desktop right sidebar, Mobile toggle) */}
          <div
            className={cn(
              "lg:w-96 lg:border-l bg-muted/10 h-full overflow-y-auto transition-all duration-300",
              activeTab === "quote" ? "hidden lg:block" : "block w-full",
            )}
          >
            <ReceiptPanel />
          </div>
        </div>

        {/* Mobile Tab Bar */}
        {/* <nav className="lg:hidden h-14 border-t bg-background flex items-center justify-around px-4">
          <Button
            variant="ghost"
            className={cn("flex flex-col gap-1 h-full w-full rounded-none", activeTab === "quote" && "text-primary")}
            onClick={() => setActiveTab("quote")}
          >
            <div className="text-[10px] uppercase font-bold">Builder</div>
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            className={cn("flex flex-col gap-1 h-full w-full rounded-none", activeTab === "receipt" && "text-primary")}
            onClick={() => setActiveTab("receipt")}
          >
            <div className="text-[10px] uppercase font-bold">Receipt</div>
          </Button>
        </nav> */}
      </main>
    </div>
  );
}
