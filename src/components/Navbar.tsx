import { Link } from "react-router-dom";
import { FileText, BarChart3, Users, Shield, HelpCircle, LogIn, LogOut, Home } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CompanyAnalytics from "@/components/CompanyAnalytics";

const navLinks = [
  { to: "/", label: "Home", icon: <Home className="w-5 h-5 mr-1" /> },
  { to: "/help", label: "Help", icon: <HelpCircle className="w-5 h-5 mr-1" /> },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false); // for mobile menu
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/";
    return user.role === 'applicant' ? '/applicant-dashboard' : '/company-dashboard';
  };

  // Links for authenticated users based on role
  const getAuthLinks = () => {
    if (!user) return [];
    
    const dashboardLink = getDashboardLink();
    const baseLinks = [
      { to: dashboardLink, label: "Dashboard", icon: <BarChart3 className="w-5 h-5 mr-1" /> },
      { to: "/help", label: "Help", icon: <HelpCircle className="w-5 h-5 mr-1" /> },
    ];

    // Add company-specific links
    if (user.role === 'company') {
      baseLinks.splice(1, 0, 
        { to: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5 mr-1" /> },
        { to: "/team", label: "Team", icon: <Users className="w-5 h-5 mr-1" /> },
        { to: "/security", label: "Security", icon: <Shield className="w-5 h-5 mr-1" /> }
      );
    }

    return baseLinks;
  };

  // Links for new members (not signed in)
  const guestLinks = [
    { to: "/security", label: "Security", icon: <Shield className="w-5 h-5 mr-1" /> },
    { to: "/help", label: "Help", icon: <HelpCircle className="w-5 h-5 mr-1" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            C-Resume
          </span>
        </Link>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/"
            className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-900 transition"
          >
            <Home className="w-5 h-5 mr-1" />
            Home
          </Link>
          {(isAuthenticated ? getAuthLinks() : guestLinks).map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-900 transition"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-red-700 border border-red-200 bg-white hover:bg-red-600 hover:text-white transition"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-blue-700 border border-blue-200 bg-white hover:bg-blue-600 hover:text-white transition"
            >
              <LogIn className="w-5 h-5 mr-1" />
              Sign Up
            </Link>
          )}
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center px-3 py-2 border rounded text-blue-700 border-blue-200 hover:bg-blue-100"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <svg className="fill-current h-5 w-5" viewBox="0 0 20 20"><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/95 border-t border-blue-100 shadow-sm px-4 pb-4">
          <Link
            to="/"
            className="flex items-center px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-900 transition"
            onClick={() => setOpen(false)}
          >
            <Home className="w-5 h-5 mr-1" />
            Home
          </Link>
          {(isAuthenticated ? getAuthLinks() : guestLinks).map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="flex items-center px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-900 transition"
              onClick={() => setOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex items-center px-4 py-3 rounded-md text-base font-medium text-red-700 border border-red-200 bg-white hover:bg-red-600 hover:text-white transition w-full text-left"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center px-4 py-3 rounded-md text-base font-medium text-blue-700 border border-blue-200 bg-white hover:bg-blue-600 hover:text-white transition"
              onClick={() => setOpen(false)}
            >
              <LogIn className="w-5 h-5 mr-1" />
              Sign Up
            </Link>
          )}
        </div>
      )}

      {/* Company Analytics Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company-Wide Analytics</DialogTitle>
          </DialogHeader>
          <CompanyAnalytics />
        </DialogContent>
      </Dialog>
    </nav>
  );
}