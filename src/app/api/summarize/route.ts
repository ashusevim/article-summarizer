import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { load } from "cheerio";
import { PDFParse } from "pdf-parse";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function getTextFromURL(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();
        const $ = load(html);

        const mainText =
            $("article").text() ||
            $("main").text() ||
            $("p")
                .map((_, el) => $(el).text())
                .get()
                .join("\n");

        return mainText.replace(/\s\s+/g, " ").trim();
    } catch (error) {
        console.error("Error scraping URL:", error);
        throw new Error("Could not scrape text from the provided URL.");
    }
}

async function getTextFromPDF(file: File) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfParser = new PDFParse({ data: Buffer.from(arrayBuffer) });
        const data = await pdfParser.getText();
        return data.text;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("Could not parse data from the provided PDF.");
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") || "";
        let textToSummarize: string;

        if (contentType.includes("application/json")) {
            const body = await request.json();
            const { url } = body;

            if (!url) {
                return NextResponse.json(
                    { error: "No URL provided" },
                    { status: 400 }
                );
            }

            textToSummarize = await getTextFromURL(url);
        } else if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File;

            if (!file) {
                throw new Error("No file provided in form data");
            }

            textToSummarize = await getTextFromPDF(file);
        } else {
            throw new Error(`Unsupported Content-Type: ${contentType}`);
        }

        if (!textToSummarize?.trim()) {
            throw new Error("Could not extract any text to summarize.");
        }

        const prompt = `${process.env.PROMPT}TEXT:"""${textToSummarize}"""`;

        const chatResponse = await client.chat.complete({
            model: "mistral-tiny-latest",
            temperature: 0.1,
            maxTokens: 600,
            messages: [{ role: "user", content: prompt }],
        });

        const summary =
            chatResponse.choices[0].message.content
                ?.toString()
                .trim()
                .replace(/\n{3,}/g, "\n\n") ?? "";

        return NextResponse.json({ summary }, { status: 200 });
    } catch (error) {
        console.error("Error in POST handler:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Invalid request";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json(
        { error: "Method not allowed. Use POST." },
        { status: 405 }
    );
}
