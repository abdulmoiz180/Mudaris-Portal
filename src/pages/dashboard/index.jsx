import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Plus, Search, Bell, Link2 } from "lucide-react";
import Workspace from "./components/workspace/index.jsx";
import { useSelector } from "react-redux";
import { useState } from "react";
import CreateWorkspace from "./components/createWorkspace.jsx";
import "./dashboard.css";
import { useIsAdmin } from "@/constants/constants.js";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar.jsx";

const Dashboard = () => {
  const fullName = useSelector((s) => s.auth.user?.user_metadata?.fullName);
  const avatarUrl = useSelector((s) => s.auth.user?.user_metadata?.avatar);
  const [isOpen, setisOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isAdmin = useIsAdmin();

  return (
    <section className="flex flex-col bg-(--background) text-(--foreground) min-h-screen">
      <div className="h-dvh z-10 w-dvw absolute overflow-hidden pointer-events-none">
        {isOpen && <CreateWorkspace />}
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-10 flex justify-between items-center px-6 py-3 border-b border-(--border) bg-(--background)">
        {/* Left side - Logo and nav items */}
  
<DashboardHeader />
        {/* Right side - notification and avatar */}
        <div className="flex items-center gap-4">
         
          <Avatar className="w-9 h-9 cursor-pointer">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-(--primary) text-white">
                {fullName?.[0]?.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-(--primary-foreground) mb-1">
              Select your Workspace
            </h1>
            <p className="text-(--muted-foreground) text-sm">
              Choose a workspace below to start collaborating or managing your courses.
            </p>
          </div>
         
        </div>

        {/* Search and Create Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-(--muted-foreground)" />
            <input
              type="text"
              placeholder="Find a workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-(--border) bg-(--input-background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--ring)"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => setisOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-(--primary) text-(--primary-foreground) hover:bg-(--primary)/90"
            >
              <Plus className="w-4 h-4" />
              Create New Workspace
            </Button>
          )}
        </div>

        {/* Workspace Grid */}
        <Workspace searchQuery={searchQuery} onCreateClick={() => setisOpen(!isOpen)} isAdmin={isAdmin} />
      </main>

      
      <DashboardFooter />
    </section>
  );
};

export default Dashboard;



function DashboardFooter() {
  return (
    <footer className="w-full py-6 border-t border-(--border)">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-(--muted-foreground)">
          © 2026 <span className="font-medium text-(--foreground)">Mudaris Academy</span>
        </p>
        <div className="flex items-center gap-6">
          <a href="/privacypolicy" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
            Terms
          </a>
          <a href="/privacypolicy" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
            Privacy
          </a>
          <a href="#" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
            Support
          </a>
        </div>
        <p className="text-sm text-(--muted-foreground)">
          Developed by{" "}
          <a href="https://asrnova.com" className="font-medium text-(--foreground) hover:underline">
            asrnova.com
          </a>
        </p>
      </div>
    </footer>
  );
}



function DashboardHeader() {
  return (
           <header className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-(--primary) flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-lg font-semibold text-(--primary-foreground)">
              Mudaris Portal
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-(--primary-foreground) border-b-2 border-(--primary-foreground) pb-1">
              Dashboard
            </span>
            <span className="text-sm text-(--muted-foreground) hover:text-(--primary-foreground) cursor-pointer">
              Help
            </span>
          </div>
        </header>
  );
}
