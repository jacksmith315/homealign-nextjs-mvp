/**
 * Simple JWT token decoder (no verification, just parsing)
 * Note: This is for extracting user info only, not for security validation
 */

export function decodeJWT(token: string): any {
  try {
    // Split the token and get the payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode from base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function extractUserFromToken(token: string): { email?: string; username?: string; userId?: string; role?: string } | null {
  try {
    const payload = decodeJWT(token);
    
    if (!payload) return null;
    
    return {
      email: payload.email || payload.user_email || payload.sub,
      username: payload.username || payload.user_username || payload.preferred_username,
      userId: payload.user_id || payload.sub || payload.id,
      role: Array.isArray(payload.roles) && payload.roles.length > 0
        ? payload.roles[0].role_name
        : payload.role_name || payload.role,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
}
