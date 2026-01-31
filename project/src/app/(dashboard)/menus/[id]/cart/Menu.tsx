'use client';

import { useState } from "react"
import Display from "./Display"

export default function Menu() {
    const products = [
        { id: '001', name: 'Chango Humilde', price: 15 },
        { id: '002', name: 'Chango Royal', price: 17 },
        { id: '003', name: 'Chango Gringa', price: 20 },
        { id: '004', name: 'Chango Choro', price: 17 },
    ]

    return <main>
        <Title>Changos BURGER</Title>
        <Category>
            {
                products.map(product => <Product key={product.id} product={product} />)
            }
        </Category>
    </main>
}

function Title({ children }) {
    return <h1>{children}</h1>
}

function Category({ children }) {
    return <div style={{ display: 'flex', gap: '20px' }}>{children}</div>
}

function Product({ product }) {
    const { name, description } = product

    return <div style={{ border: 'solid black' }}>
        <h2>{name}</h2>
        <p>{description}</p>
    </div>
}