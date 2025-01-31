// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }
    const sql = neon(process.env.DATABASE_URL, { 
        fetchOptions: { 
            timeout: 10000 // 10 seconds in milliseconds
        } 
    });
    const data = await sql`...`;
    return data;
}