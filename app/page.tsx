"use client";

import React, { useState, ChangeEvent } from "react";
import { Loader2, Mail, FileText, Sparkles } from "lucide-react"; 

export default function Home() {
  const [transcript, setTranscript] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>(
    "Summarize in concise bullet points focusing on decisions, owners, and deadlines."
  );
  const [summary, setSummary] = useState<string>("");
  const [emailTo, setEmailTo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const readTxtFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setTranscript(String(reader.result ?? ""));
    reader.onerror = () => alert("Failed to read the file.");
    reader.readAsText(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type && f.type !== "text/plain") {
      alert("Please upload a .txt file.");
      return;
    }
    readTxtFile(f);
    e.target.value = "";
  };

  const generateSummary = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, prompt: customPrompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed: ${res.status}`);
      }

      const data: { summary?: string } = await res.json();
      setSummary(data.summary ?? "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to summarize";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!summary.trim() || !emailTo.trim()) return;
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: emailTo, summary }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed: ${res.status}`);
      }

      alert("Email sent.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send email";
      alert(msg);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-12">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Sparkles className="w-7 h-7 text-indigo-600" /> AI Meeting Summarizer
      </h1>
      <p className="text-gray-500 mb-8">
        Upload transcripts, generate concise AI summaries, and send them via email.
      </p>

      <div className="w-full max-w-3xl space-y-6">
        {/* Upload + Transcript */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" /> Transcript
          </h2>

          <input
            type="file"
            accept=".txt,text/plain"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          <textarea
            placeholder="Paste your meeting notes or call transcript here…"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full min-h-[140px] p-3 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Custom Prompt */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-lg">Custom Instruction</h2>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500">
            This will be appended to your transcript before summarization.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTranscript("");
                setSummary("");
              }}
              className="px-4 py-2 rounded-lg border text-sm bg-gray-100 hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={generateSummary}
              disabled={loading || !transcript.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? "Summarizing…" : "Generate Summary"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-lg">Summary</h2>
          <textarea
            placeholder="Summary will appear here. You can edit before sending."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full min-h-[160px] p-3 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Email */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-600" /> Send via Email
          </h2>
          <input
            type="email"
            placeholder="recipient@example.com"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={sendEmail}
            disabled={!summary.trim() || !emailTo.trim()}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
          >
            Send Email
          </button>
        </div>
      </div>

      <footer className="mt-8 text-xs text-gray-500">
        
      </footer>
    </main>
  );
}
