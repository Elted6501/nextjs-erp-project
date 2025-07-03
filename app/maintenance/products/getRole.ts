'use server';

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export async function getRole(){
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      const JWT_SECRET:string = process.env.JWT_SECRET!;
  
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
          return {
            employee_id: decoded.employee_id,
            first_name: decoded.first_name,
            last_name: decoded.last_name
          };
        } catch (err) {
          console.error('Invalid token', err);
        }
    
      }
 
}