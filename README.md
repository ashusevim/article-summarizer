# Article Summarizer

An AI-powered article summarizer built with Next.js that extracts and summarizes content from article links and PDFs using Mistral AI, providing summaries in markdown format.

## Description

Article Summarizer is a web application that allows users to paste any article URL or upload a PDF file and instantly receive an AI-generated summary. The tool uses the Mistral AI API for intelligent summarization and Cheerio for web scraping to extract article content. This is a learning project, created for fun and experimentation.

## Features

- 🔗 Summarize articles from URLs
- 📄 Support for PDF files
- 🤖 AI-powered summaries using Mistral AI
- 📥 Export summaries as markdown files
- 🎨 Clean and intuitive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js, React.js, Tailwind CSS
- **AI**: Mistral AI API
- **Utilities**: Cheerio (web scraping), PDF-Parse (PDF extraction)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ashusevim/article-summarizer.git
cd article-summarizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

Get your Mistral API key from [Mistral AI](https://mistral.ai)

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Paste an article URL in the input field and click "Magic" to generate a summary

4. Use the "Export" button to download the summary as a markdown file

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts          # API endpoint for summarization
│   ├── page.tsx                  # Main UI component
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
```

## API Endpoints

### POST `/api/summarize`

Summarizes content from a provided URL.

**Request body:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "summary": "Markdown formatted summary..."
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see `LICENSE` for details.