// 'use client';

import React from 'react';
import * as Babel from '@babel/standalone';

import Menu from './cart/Menu';
import { CartProvider } from './cart/Context';
import Cart from './cart/Cart';
import Display from './cart/Display';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Renderer from './Renderer';
import Client from './Client';



export default async function Page({ params }) {
    const { id } = await params

    return <>
        <Renderer id={id} />
        <Client />
    </>
}

