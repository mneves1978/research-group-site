export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Step 1: Decap redirects here to start login. We forward to GitHub.
    if (url.pathname === "/auth") {
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
      return Response.redirect(authUrl.toString(), 302);
    }

    // Step 2: GitHub redirects back here with a temporary code. We
    // exchange it for an access token and hand it back to the CMS
    // tab via postMessage.
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error || !tokenData.access_token) {
        return new Response(
          `Authentication failed: ${tokenData.error_description || "unknown error"}`,
          { status: 400 }
        );
      }

      const payload = JSON.stringify({ token: tokenData.access_token, provider: "github" });

      const html = `<!doctype html>
<html><body>
<script>
  (function () {
    function receiveMessage() {
      window.opener.postMessage(
        'authorization:github:success:${payload}',
        '*'
      );
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
Authenticated — you can close this window if it doesn't close automatically.
</body></html>`;

      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
};
