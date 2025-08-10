export async function generateAIContent(product: any) {
  const prompt = `اكتب وصفًا جذابًا لمنتج بعنوان: ${product.title}، مع ذكر الفوائد الرئيسية.`;
  const response = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}