'use client';

import { useEffect, useState } from "react";
import { useCart } from './Context';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { ShoppingBagIcon } from "lucide-react";

// import { loadStripe } from '@stripe/stripe-js';
// export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ShoppingCart() {
    const cart = useCart();

    const handleBuy = async () => {
        console.log('In Cart!!!')

        const result = await fetch('/api/payments/stripe', {
            method: 'POST',
            body: JSON.stringify({
                items: cart.items,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('In Cart - result!!!')
        console.log(result)

        const data = await result.json()
        console.log('In Cart - data!!!')
        console.log(data)

        window.location.href = data.session.url
    }

    return <Drawer autoFocus={true} >
        <DrawerTrigger asChild>
            <Button className="fixed bottom-10 right-10 rounded-full scale-200" size='icon-lg'><ShoppingBagIcon /></Button>
            {/* <ShoppingBagIcon size={48} /> */}
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader className="text-left">
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                </DrawerDescription>
            </DrawerHeader>


            <ol style={{ border: 'solid green' }}>
                {
                    cart.items.map(product => <li key={product.id}>
                        <Item product={product} />
                    </li>)
                }
            </ol>

            <DrawerFooter className="pt-2">
                <Button onClick={handleBuy}>Comprar</Button>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>

}

function Item({ product }) {
    const { id, name, price, quantity } = product

    const cart = useCart();

    return <div style={{ display: 'flex', gap: 20 }}>
        <span>{name}</span>
        <span>{price / 100}</span>
        <span>{quantity}</span>
        <button onClick={() => cart.remove({ id, quantity: 1 })}>Remove</button>
    </div>
}