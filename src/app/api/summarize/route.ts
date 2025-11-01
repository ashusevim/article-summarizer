import { NextResponse } from "next/server"
import { Mistral } from "@mistralai/mistralai";
import { load } from "cheerio";
const pdf = require('pdf-parse');

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey })

async function getTextFromURL(url: string) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch url: ${response.statusText}`)
        }
        const html = response.text()
        const $ = load(await html)
        return response.json()
    } catch (error) {
        console.log("Error scraping url: ", error)
        throw new Error('Could not scrap from the provided url.')
    }
}

async function getTextFromPDF(file: File) {
    try {
        //convert the file to a buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        //parse the pdf
        const data = await pdf(file)
        return data.text
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
            Please provide a concise, expert summary of the following text.
            Focus on the key points, main arguments, and conclusions.
            Format the output as clean markdown.

            TEXT: 
            """
            ${textToSummarize}
            """
        `

        const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }]
        })

        const summary = chatResponse.choices[0].message.content

        // success message
        return NextResponse.json({ summary }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
}