import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const AUTH_STORAGE_KEY = "carryio_user";
const CART_STORAGE_KEY = "carryio_cart";

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed on backend:", err);
    }
    setUser(null);
    setCartItems([]);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (name) => {
    setCartItems((prev) => prev.filter((item) => item.name !== name));
  };

  const increaseQuantity = (name) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (name) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.name === name
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        cartItems,
        cartCount,
        login,
        logout,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
