'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Item = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type Context = {
    items: Item[];
    include: (product: Item) => void;
    remove: (item: Pick<Item, 'id' | 'quantity'>) => void;
};

const context = createContext<Context | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Item[]>([]);

    const include = (product: Item) => {
        setItems(state => {
            const isIncluded = state.find((item) => item.id === product.id);

            let items = null
            if (isIncluded) {
                items = state.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                items = [...state, { ...product, quantity: 1 }];
            }
            return items
        });
    };

    const remove = ({ id, quantity }: { id: string, quantity: number }) => {
        setItems(state => {
            let items = state.map(item => item.id === id ? { ...item, quantity: item.quantity - quantity } : item);
            items = items.filter(item => 0 < item.quantity)
            return items
        });
    };

    return <context.Provider value={{ items, include, remove }}>
        {children}
    </context.Provider>
};

export const useCart = () => {
    const cart = useContext(context);
    if (!cart) throw new Error('useCart must be used within a CartProvider');
    return cart;
};
