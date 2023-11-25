import { createContext, ReactNode, useContext, useState } from 'react';
import { ShoppingCart } from '../components/ShoppingCart';
import { useLocalStorage } from '../hooks/useLocalStorage';

type ShoppingCartProviderProps = {
  children: ReactNode
};

type CartItem = {
  id: number
  quantity: number
};

type ShoppingCartContext = {
  openCart: () => void
  closeCart: () => void
  getItemQuantity: (id: number) => number
  increaseCartQuantity: (id: number) => void
  decreaseCartQuantity: (id: number) => void
  removeFromCart: (id: number) => void
  cartQuantity: number
  cartItems: CartItem[]
};

const ShoppingCartContext = createContext({} as ShoppingCartContext);

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
};

export function ShoppingCartProvider({ children }:ShoppingCartProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('shopping-cart', []);

  const cartQuantity = cartItems.reduce(
    (quantity, item) => item.quantity + quantity,
    0
  );

  const openCart = () => setIsOpen(true);

  const closeCart = () => setIsOpen(false);

  function getItemQuantity(id: number) {
    return cartItems.find(item => item.id === id)?.quantity || 0;
  };

  function increaseCartQuantity(id: number) {
    setCartItems(currItems => {
/* if the item doesn't exist in the cart then add that item */
      if (currItems.find(item => item.id === id) == null) {
        return [...currItems, { id, quantity: 1 }];
/* if the item does exist then increase the item quantity */
      } else {
        return currItems.map(item => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
/* return the item as is without any changes */
            return item;
          }
        });
      }
    });
  };

  function decreaseCartQuantity(id: number) {
    setCartItems(currItems => {
/* if the item quantity is 1 then remove from cart */
      if (currItems.find(item => item.id === id)?.quantity === 1) {
        return currItems.filter(item => item.id !== id);
/* if the item quantity > 1 then decrement the quantity by 1*/
      } else {
        return currItems.map(item => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
/* return the item as is without any changes */
            return item;
          }
        });
      }
    });
  };

  function removeFromCart(id: number) {
    setCartItems(currItems => {
      return currItems.filter(item => item.id !== id);
    });
  };

  return (
    <ShoppingCartContext.Provider 
    value={{ 
      getItemQuantity, 
      increaseCartQuantity, 
      decreaseCartQuantity, 
      removeFromCart,
      cartItems,
      cartQuantity, 
      openCart,
      closeCart,
    }}
    >
      {children}
      <ShoppingCart isOpen={isOpen} />
    </ShoppingCartContext.Provider>
  );
};