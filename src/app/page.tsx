"use client"

export default function Home() {
    return (
        <>
            <div className="w-full h-screen flex justify-center items-center flex-col space-y-3">
                <div>
                    <h1 className="text-4xl text-center">Article Summariser</h1>
                    <p className="text-gray-300">paste any article link and get an instant AI-powered summary</p>
                </div>
                <div>
                    <form action="" method="post" className="space-x-1">
                        <input type="url" name="" id="" className="border-2 rounded-lg p-1"/>
                        <button className="border-2 rounded-lg p-1">Magic</button>
                    </form>
                </div>
                <div className="w-1/2 h-[200px] border-2">
                    
                </div>
            </div>
        </>
    );
}
