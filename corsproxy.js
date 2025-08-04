export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Extract target URL from the request
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Validate that it's a Supabase URL (security measure)
    if (!targetUrl.includes('.supabase.co')) {
      return new Response('Only Supabase URLs are allowed', { status: 403 });
    }

    try {
      // Forward the request to Supabase
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      const response = await fetch(modifiedRequest);
      
      // Create new response with CORS headers
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
        },
      });

      return modifiedResponse;
    } catch (error) {
      return new Response(`Proxy error: ${error.message}`, { status: 500 });
    }
  },
};
