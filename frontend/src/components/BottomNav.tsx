import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircle, Plus, List, Share2 } from "lucide-react";
import { useWebShare } from "../hooks/useWebShare";

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { share } = useWebShare();

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const handleShare = () => {
    share({
      title: "Animal Pashu Bazar",
      text: "Join me on Animal Pashu Bazar - buy and sell animals easily!",
      url: window.location.origin,
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {/* Home */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors"
        >
          <span className={isActive("/") ? "text-primary" : "text-gray-400"}>
            <Home className="w-5 h-5" />
          </span>
          <span
            className={`text-xs font-medium transition-colors ${
              isActive("/") ? "text-primary" : "text-gray-400"
            }`}
          >
            Home
          </span>
          {isActive("/") && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
          )}
        </Link>

        {/* Chats */}
        <Link
          to="/messages"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors"
        >
          <span className={isActive("/messages") ? "text-primary" : "text-gray-400"}>
            <MessageCircle className="w-5 h-5" />
          </span>
          <span
            className={`text-xs font-medium transition-colors ${
              isActive("/messages") ? "text-primary" : "text-gray-400"
            }`}
          >
            Chats
          </span>
          {isActive("/messages") && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
          )}
        </Link>

        {/* Sell — prominent center button */}
        <Link
          to="/post-ad"
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-white">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-primary mt-1">Sell</span>
        </Link>

        {/* My Ads */}
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors"
        >
          <span className={isActive("/dashboard") ? "text-primary" : "text-gray-400"}>
            <List className="w-5 h-5" />
          </span>
          <span
            className={`text-xs font-medium transition-colors ${
              isActive("/dashboard") ? "text-primary" : "text-gray-400"
            }`}
          >
            My Ads
          </span>
          {isActive("/dashboard") && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
          )}
        </Link>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors"
        >
          <span className="text-gray-400">
            <Share2 className="w-5 h-5" />
          </span>
          <span className="text-xs font-medium text-gray-400">Share</span>
        </button>
      </div>
    </nav>
  );
}
