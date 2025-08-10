export async function processImages(images: string[]) {
  return Promise.all(images.map(async (imgUrl) => {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image_url: imgUrl, size: 'auto' })
    });
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  }));
}