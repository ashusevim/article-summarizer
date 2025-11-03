import { NextResponse } from "next/server"
import { Mistral } from "@mistralai/mistralai";
import { load } from "cheerio";
import { PDFParse } from "pdf-parse"

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey })

async function getTextFromURL(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();
        const $ = load(html);

        // Try to get text from the <article> tag first
        let mainText = $('article').text();

        // If <article> is empty, try <main>
        if (!mainText) {
            mainText = $('main').text();
        }

        // As a fallback, get all <p> tags if the others fail
        if (!mainText) {
            mainText = $('p')
                .map((i, el) => $(el).text())
                .get()
                .join('\n');
        }

        // Clean up whitespace
        return mainText.replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        console.error('Error scraping URL:', error);
        throw new Error('Could not scrape text from the provided URL.');
    }
}

async function getTextFromPDF(file: File) {
    try {
        //convert the file to a buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        //parse the pdf
        const parse = new PDFParse({ url: file.name });
        const result = parse.getText()

        return (await result).text

    } catch (error) {
        console.log("Error parsing pdf: ", error)
        throw new Error('Could not parse data from the provided pdf')
    }
}

export async function POST(request: Request) {
    try {

        const contentType = request.headers.get('content-type') || ''
        let textToSummarize: string;

        // get text from request
        if (contentType.includes('application/json')) {
            // it is a url
            const body = await request.json();
            const { url } = body;
            if (!url) {
                console.log("No url is provided in the input field")
            }
            textToSummarize = await getTextFromURL(url);
        } else if (contentType.includes('multipart/form-data')) {
            // it is a PDF file
            const formData = await request.formData();
            const file = formData.get('file') as File;
            if (!file) {
                throw new Error('No file provided in form data')
            }
            textToSummarize = await getTextFromPDF(file)
        } else {
            throw new Error(`Unsupported Content-Type: ${contentType}`)
        }

        if (!textToSummarize) {
            throw new Error('Could not extract any text to summarize.')
        }

        const prompt = `
            You are an editorial assistant.
            Produce a Markdown summary with:
            - A level-2 heading for the article title
            - 3–5 bullet points covering key facts.
            - A short "Key Quote" blockquote when a notable sentence exists.
            Keep it under 180 words and avoid filler.
            
            TEXT:
            """
            ${textToSummarize}
            """
        `

        const chatResponse = await client.chat.complete({
            model: 'mistral-tiny-latest',
            temperature: 0.1,
            maxTokens: 600,
            messages: [{ role: 'user', content: prompt }]
        })

        const summary = chatResponse.choices[0].message.content?.toString().trim().replace(/\n{3,}/g, '\n\n') ?? ''

        // success message
        return NextResponse.json({ summary }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
}