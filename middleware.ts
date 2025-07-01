import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET:string = process.env.JWT_SECRET!;

export function middleware(request: NextRequest){
    if (request.nextUrl.pathname.startsWith('/maintenance')) {        
        const response = NextResponse.next();
        const information = request.cookies.get('token')?.value;
          
        if(information){
            jwt.verify(information, JWT_SECRET, (err)=>{
                if(err){
                    return NextResponse.redirect(new URL('/login', request.nextUrl));
                }
                  
                return response;
            });
        }else{
            return NextResponse.redirect(new URL('/login', request.nextUrl));
        }
      
        return response;
  }
}
