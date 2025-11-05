import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Mistral } from "@mistralai/mistralai";
import { load } from "cheerio";

const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
});

async function getTextFromURL(url: string): Promise<string>{
    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Failed to fetch URL: ${response.statusText}`)
        }
        const html = await response.text();
        const $ = load(html);

        // try to get text from the <article> tag first
        let mainText = $('article').text()

        // if <article> is empty, try <main>
        if(!mainText){
            mainText = $('main').text();
        }

        // get all <p> tags if other  
        if(!mainText){
            mainText = $('p')
                .map((i, el) => $(el).text())
                .get()
                .join('\n');
        }

        //clean up the whitespace
        return mainText.replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        console.error('Error scraping URL:', error);
        throw new Error('Could not scrap text from the provided URL.')
    }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the request body
        const body = JSON.parse(event.body || '{}')
        const { url } = body

        // Validate URL
        if(!url){
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'URL is required' })
            };
        }

        const textToSummarize = await getTextFromURL(url)
        
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