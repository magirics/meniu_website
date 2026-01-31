'use client';

import { useCart } from "./Context"
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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

const doEffect = (effect, dependency) => {
    const run = async () => await effect()
    useEffect(() => { run() }, dependency);
}

export default function Display() {
    const cart = useCart()
    const [open, setOpen] = useState(false)
    const [product, setProduct] = useState(null)

    doEffect(async () => {
        const response = await fetch('/api/products')
        const result = await response.json()
        const products = result.items;

        const elements = document.getElementsByClassName('product');
        for (const element of elements) {
            // data-id = element.dataset.id
        }

        for (const element of elements) {
            const id = element.dataset.id;
            console.log(id)
            const product = products.find(product => id === product.id)
            element.addEventListener('click', () => setProduct(product));
        }
    }, []);

    useEffect(() => {
        if (product) setOpen(true)
        else setOpen(false)
    }, [product]);

    const handleClose = () => {
        setProduct(null);
    }

    return <Drawer open={open} onOpenChange={setOpen} onClose={handleClose} autoFocus={true} >
        <DrawerContent>
            <DrawerHeader className="text-left">
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                </DrawerDescription>
            </DrawerHeader>
            <h1>{product?.name}</h1>
            <DrawerFooter className="pt-2">
                <Button onClick={() => cart.include(product)}>Añadir</Button>
                <DrawerClose asChild>
                    <Button variant="outline" >Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>


    // <div style={{border: 'solid red'}}>
    //     <p>{product.name}</p>
    //     <button onClick={() => cart.include(product)}>Add to Cart</button>
    // </div>
}