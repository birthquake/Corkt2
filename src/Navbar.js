import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Corkt</h1>
          </div>
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-yellow-300 font-bold" : "hover:text-yellow-300"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                isActive ? "text-yellow-300 font-bold" : "hover:text-yellow-300"
              }
            >
              Gallery
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? "text-yellow-300 font-bold" : "hover:text-yellow-300"
              }
            >
              Upload
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "text-yellow-300 font-bold" : "hover:text-yellow-300"
              }
            >
              Profile
            </NavLink>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-white hover:text-yellow-300 focus:outline-none"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
