export async function buildNoCacheResponseAsProxy(
  url: string
): Promise<Response> {
  return fetch(url).then((originResponse) => {
    const result = new Response(originResponse.body, originResponse);
    result.headers.set("Cache-Control", "no-cache");
    return result;
  });
}
