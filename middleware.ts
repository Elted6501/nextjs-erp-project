import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET:string = process.env.JWT_SECRET!;

async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await jwtVerify(token, secret);
}

export async function middleware(request: NextRequest){
    if (request.nextUrl.pathname.startsWith('/maintenance')) {        
        const information = request.cookies.get('token')?.value;
        
        if(!information){
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            await verifyJWT(information);
            return NextResponse.next();
        } catch (err) {
            console.error('Token verification failed', err);
            return NextResponse.redirect(new URL('/login', request.url));
        }  
    }
}

