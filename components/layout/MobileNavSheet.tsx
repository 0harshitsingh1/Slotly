import Link from "next/link";
import { LayoutDashboard, User, HelpCircle, Search, Info, Calendar } from "lucide-react";
import { HeaderUser } from "./HeaderClient";
import { Button } from "@/components/ui/Button";

interface MobileNavSheetProps {
  user: HeaderUser | null | undefined;
  onClose: () => void;
}

export function MobileNavSheet({ user, onClose }: MobileNavSheetProps) {
  return (
    <div className="border-b border-slate-200 bg-white p-4 md:hidden dark:border-slate-800 dark:bg-slate-950 animate-in slide-in-from-top duration-200 space-y-3">
      <div className="space-y-1">
        {user?.role === "OWNER" ? (
          <>
            <Link
              href="/owner"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Owner Dashboard</span>
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Profile Settings</span>
            </Link>
            <Link
              href="/support"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Customer Support</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/businesses"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Explore Businesses</span>
            </Link>
            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Info className="h-4 w-4 text-slate-400 shrink-0" />
              <span>About Slotly</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/customer/bookings"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>My Bookings</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/support"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Customer Support</span>
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {!user && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link href="/login" onClick={onClose}>
            <Button variant="outline" size="sm" fullWidth>
              Log in
            </Button>
          </Link>
          <Link href="/signup" onClick={onClose}>
            <Button variant="primary" size="sm" fullWidth>
              Sign up
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
