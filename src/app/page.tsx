"use client"
import { FormEvent, useState } from "react";
import { CgNotes } from "react-icons/cg";
import { GoDownload } from "react-icons/go";
import Markdown from 'markdown-to-jsx';

export default function Home() {
    const [summary, setSummary] = useState<string>("");

    const handleMagic = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const article = data.get("url");

        if (typeof article !== "string" || !article) {
            console.log("No URL provided");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/summarize', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: article })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const summarizedText = await response.json()
            setSummary(summarizedText.summary)
        } catch (error) {
            console.log('Error:', error)
        }
    }

    function handleExport(event: FormEvent<HTMLButtonElement>): void {
        if (!summary) {
            console.log("Nothing to export")
            return;
        }

        // create a blob with markdown content
        const blob = new Blob([summary], { type: "text/markdown" })

        // create a temporary URL for the blob
        const url = URL.createObjectURL(blob)

        // create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = "summary.md";
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url)
    }

    return (
        <>
            <div className="w-full h-screen flex justify-center items-center flex-col">
                <div className="p-2 text-center">
                    <h1 className="text-4xl tracking-tight font-bold">Article Summariser</h1>
                    <p className="text-slate-800">
                        Paste any article link and get an instant AI-powered summary
                    </p>
                </div>

                <div className="border-4 p-4 rounded-md min-w-130">
                    <form
                        method="post"
                        className="flex space-x-2 mb-4"
                        onSubmit={handleMagic}
                    >
                        <input
                            type="url"
                            name="url"
                            className="border-2 rounded-lg px-2 py-1 w-full bg-white text-black"
                            placeholder="Enter the URL"
                        />
                        <button
                            className="hover:bg-black hover:text-white border-2 rounded-lg px-3 py-1 cursor-pointer"
                            type="submit"
                        >
                            Magic
                        </button>
                    </form>

                    <div className="h-[400px] border rounded-sm relative overflow-scroll">
                        {/* Toolbar */}
                        <div className="flex items-center justify-evenly space-x-10 p-2 sticky top-0 border-b bg-white z-20">
                            <div className="flex items-center space-x-1">
                                <CgNotes />
                                <h2 className="font-medium">Summary</h2>
                            </div>
                            <button
                                onClick={handleExport}
                                type="button"
                                className="flex items-center cursor-pointer space-x-1 border p-2 rounded-md hover:bg-black hover:text-white transition"
                            >
                                <GoDownload />
                                <span>Export</span>
                            </button>
                        </div>

                        <div className="p-4">
                            {summary ? (
                                <Markdown className="prose prose-sm max-w-110 prose-headings:font-semibold prose-h2:text-xl prose-p:text-gray-700 prose-ul:list-disc prose-ul:ml-4 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic">
                                    {summary}
                                </Markdown>
                            ) : (
                                <p className="text-gray-500">No summary yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}