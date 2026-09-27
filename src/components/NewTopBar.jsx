
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const NewTopBar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  const menuItems = [
    { label: "Home", items: [], path: "/" },
    { label: "About", items: [], path: "/about" },
    { label: "How To Apply", items: [], path: "/how-to-apply" },
    {
      label: "Downloads",
      items: [
        { label: "Income Certificate", path: "#" },
        { label: "User Manual", path: "#" },
        { label: "User Manual For Non-NET", path: "#" },
        { label: "HDI Forwarding Letter", path: "#" },
        { label: "GUIDELINES", path: "#" },
        { label: "TR FORM 7", path: "#" },
      ],
    },
    { label: "Contacts", items: [], path: "/contactd" },
    { label: "Weblinks", items: [], path: "#" },
    { label: "Emergency Relief Fund", items: [], path: "#" },
  ];

  return (
    <div className="bg-gray-900 text-white w-full shadow-md hidden sm:block">
      <div className="container mx-auto py-2">
        <ul className="flex flex-wrap justify-between">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(index)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={item.path}
                className={`block px-5 py-4 text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 group-hover:text-blue-300 rounded-md ${
                  location.pathname === item.path ? "text-blue-300" : ""
                }`}
              >
                {item.label}
                {item.items.length > 0 && (
                  <ChevronDown
                    className="inline-block ml-2 group-hover:transform group-hover:rotate-180 transition-transform duration-200"
                    size={16}
                  />
                )}
              </Link>
              {item.items.length > 0 && activeDropdown === index && (
                <ul className="absolute left-0 mt-1 w-56 bg-white text-gray-800 shadow-lg rounded-md overflow-hidden z-10">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <Link
                        to={subItem.path}
                        className={`block px-5 py-3 text-md hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 ${
                          location.pathname === subItem.path ? "text-blue-600" : ""
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewTopBar;
