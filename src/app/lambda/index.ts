import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Mistral } from "@mistralai/mistralai";
import { load } from "cheerio";

const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '{}')
        const { url } = body

        const response = await fetch(url)
        const html = await response.text()
        const $ = load(html)

        let textToSummarize = $('article').text() || $('main').text() || $('p').map((i, el) => $(el).text()).get().join('\n')

        const prompt = `${process.env.PROMPT}\n\nTEXT:\n"""\n${textToSummarize}\n"""`

        const chatResponse = client.chat.complete({
            model: "mistral-tiny-latest",
            temperature: 0.1,
            maxTokens: 600,
            messages: [{ role: 'user', content: prompt }]
        })

        const summary = (await chatResponse).choices[0].message.content?.toString().trim() ?? '';

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ summary })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Invalid request'
            })
        }
    }
}