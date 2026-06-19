import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  medicineId: string;
  name: string;
  genericName: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (medicine: { id: string; name: string; genericName: string; price: number }) => void;
  removeFromCart: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rc_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rc_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (medicine: { id: string; name: string; genericName: string; price: number }) => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.medicineId === medicine.id);
      if (existingIdx !== -1) {
        const newItems = [...prevItems];
        newItems[existingIdx].quantity += 1;
        return newItems;
      }
      return [...prevItems, {
        medicineId: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        quantity: 1,
        price: medicine.price
      }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.medicineId !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
