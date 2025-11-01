import { NextRequest, NextResponse } from "next/server"
import { Mistral } from "@mistralai/mistralai";
import { load } from "cheerio";
import pdf from "pdf-parse"; 

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey })

async function getTextFromURL(url: string){
    const data = fetch(url)
    return data
}

async function dataFromPDF(file: File) {
    
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { url }  = body
    if(!url){
        console.log("No url is provided in the input field")
    }
    let textToSummarize = getTextFromURL(url)
    console.log(textToSummarize)
}