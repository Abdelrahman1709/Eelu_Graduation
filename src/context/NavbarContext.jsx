import { createContext, useContext, useState } from "react";

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [navbarMode, setNavbarMode] = useState("auto"); // auto | always | hidden

  const showNavbar = () => {
    setNavbarVisible(true);
    setNavbarMode("auto");
  };

  const hideNavbar = () => {
    setNavbarVisible(false);
    setNavbarMode("hidden");
  };

  const toggleNavbar = () => {
    setNavbarVisible(!navbarVisible);
  };

  return (
    <NavbarContext.Provider
      value={{
        navbarVisible,
        navbarMode,
        showNavbar,
        hideNavbar,
        toggleNavbar,
        setNavbarMode,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within NavbarProvider");
  }
  return context;
}
