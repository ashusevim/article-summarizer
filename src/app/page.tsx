"use client"
import { CgNotes } from "react-icons/cg";
import { GoDownload } from "react-icons/go";

export default function Home() {

    const handleMagic = async (e: { preventDefault: () => void; target: { value: any; }[]; }) => {
        e.preventDefault();
        let article = e.target[0].value

        const data = await fetch('http://localhost:3000/api/summarize', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: article })
        })

        const summarizedText = await data.json()

        console.log(summarizedText)
    }

    return (
        <>
            <div className="w-full h-screen flex justify-center items-center flex-col">
                <div className="p-2">
                    <h1 className="text-4xl text-center tracking-tight font-bold">Article Summariser</h1>
                    <p className="text-slate-800">paste any article link and get an instant AI-powered summary</p>
                </div>
                <div className="border-4 p-4 rounded-md">
                    <div>
                        <form method="post" className="space-x-1 space-y-2" onSubmit={handleMagic}>
                            <input type="url" name="" id="" className="border-2 rounded-lg px-2 py-1 w-100" placeholder="Enter the url" />
                            <button className="hover:bg-black hover:text-white border-2 rounded-lg px-3 py-1 cursor-pointer" type="submit" id="submit-magic">Magic</button>
                        </form>
                    </div>
                    <div className="w-full h-[350px] border-2 rounded-sm">
                        <div className="flex justify-around mt-2 space-x-3">
                            <div className="flex justify-center items-center p-1 space-x-1">
                                <CgNotes />
                                <h2>Summary</h2>
                            </div>
                            <div className="flex justify-center items-center cursor-pointer space-x-1 border p-2 rounded-md hover:bg-black hover:text-white">
                                <GoDownload className="cursor-pointer" />
                                <button type="submit" id="export" className="cursor-pointer">Export</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
