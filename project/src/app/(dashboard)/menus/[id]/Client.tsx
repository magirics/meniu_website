'use client';

import { CartProvider } from "./cart/Context";
import Cart from './cart/Cart';
import Display from "./cart/Display";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Client() {

    const searchParams = useSearchParams();
    // const params = useParams();
    // const { id } = params;

    useEffect(() => {
        const checkoutId = searchParams.get('checkout_id')
        if (checkoutId) {
            // Check on backend before showing message
            // toast('Compra exitosa');
            toast.success('Compra exitosa', { position: 'top-center' });
        }
    }, [])

    return <>
        <CartProvider>
            <Display />
            <Cart />
        </CartProvider>
        <Toaster />
    </>
}