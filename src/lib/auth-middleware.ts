
import { auth } from './firebase-admin';
import { NextResponse } from 'next/server';

/**
 * Validates that the request has a valid Firebase ID Token with admin claims.
 * @param request The incoming Next.js Request object.
 * @returns The decoded token if valid.
 * @throws An error if unauthorized.
 */
export async function validateAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken.admin) {
      throw new Error('Access denied: User does not have admin privileges');
    }

    return decodedToken;
  } catch (error: any) {
    console.error('[AuthMiddleware] Verification failed:', error.message);
    throw new Error('Unauthorized');
  }
}

/**
 * Higher-order function to protect API routes.
 */
export function withAdminAuth(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      const admin = await validateAdmin(request);
      return await handler(request, admin, ...args);
    } catch (error: any) {
      console.error('[AuthMiddleware] Unauthorized access attempt:', error);
      return NextResponse.json(
        { error: error.message || 'Unauthorized' }, 
        { status: 401 }
      );
    }
  };
}
