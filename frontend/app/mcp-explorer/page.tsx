"use client";

import { useState } from "react";

export default function MCPExplorer() {
    const [url, setUrl] = useState("https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp");
    const [logs, setLogs] = useState<string[]>([]);
    const [tools, setTools] = useState<any[]>([]);
    const [capabilities, setCapabilities] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "connecting" | "streaming" | "complete" | "error">("idle");

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runDemo = async () => {
        setLogs([]);
        setTools([]);
        setCapabilities(null);
        setStatus("connecting");
        addLog("🚀 Starting MCP SSE Handshake (via Proxy)...");
        addLog(`📍 Target URL: ${url}`);

        const processStream = async (response: Response, onJson: (data: any) => void) => {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No reader available");

            let buffer = "";
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        addLog(`📥 DATA: ${trimmed.substring(0, 100)}${trimmed.length > 100 ? "..." : ""}`);

                        if (trimmed.startsWith("data: ")) {
                            try {
                                const json = JSON.parse(trimmed.substring(6));
                                onJson(json);
                            } catch (e) { }
                        }
                    }
                }
            }
        };

        try {
            // STEP 1: INITIALIZE
            addLog("📡 Step 1: Sending 'initialize' request...");

            const response = await fetch("/api/mcp-proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: url,
                    body: {
                        jsonrpc: "2.0",
                        method: "initialize",
                        params: {
                            protocolVersion: "2024-11-05",
                            capabilities: {},
                            clientInfo: { name: "visual-explorer", version: "1.0" }
                        },
                        id: 1
                    }
                })
            });

            if (!response.ok) throw new Error(`Init Failed: ${response.status}`);

            setStatus("streaming");
            await processStream(response, (data) => {
                if (data.result?.capabilities) {
                    setCapabilities(data.result.capabilities);
                    addLog("✨ Server Capabilities Received!");

                    // Some servers include tools in capabilities
                    if (data.result.capabilities.tools) {
                        const capTools = data.result.capabilities.tools;
                        const toolArray = Array.isArray(capTools) ? capTools :
                            Object.entries(capTools).map(([name, detail]: any) => ({ name, ...detail }));
                        if (toolArray.length > 0) {
                            setTools(toolArray);
                            addLog(`📦 Tools found in Capabilities: ${toolArray.length}`);
                        }
                    }
                }
            });

            // STEP 1.5: INITIALIZED NOTIFICATION
            addLog("📡 Step 1.5: Sending 'notifications/initialized'...");
            await fetch("/api/mcp-proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: url,
                    body: {
                        jsonrpc: "2.0",
                        method: "notifications/initialized",
                        params: {}
                    }
                })
            });

            // STEP 2: LIST TOOLS
            addLog("📡 Step 2: Requesting 'list_tools'...");
            const toolResponse = await fetch("/api/mcp-proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: url,
                    body: {
                        jsonrpc: "2.0",
                        method: "list_tools",
                        params: {},
                        id: 2
                    }
                })
            });

            if (!toolResponse.ok) throw new Error(`Tool List Failed: ${toolResponse.status}`);

            await processStream(toolResponse, (data) => {
                if (data.result?.tools) {
                    setTools(data.result.tools);
                    addLog(`✅ Final Tools Discovered: ${data.result.tools.length}`);
                }
                if (data.error) {
                    addLog(`⚠️ Server Method Tip: ${data.error.message}`);
                }
            });

            setStatus("complete");
            addLog("🏁 Handshake Complete.");

        } catch (err: any) {
            addLog(`❌ ERROR: ${err.message}`);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <header className="max-w-7xl mx-auto mb-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                            Visual MCP Explorer
                        </h1>
                        <p className="text-gray-400">Deep-dive into the Model Context Protocol Handshake</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
                        <div className={`text-sm font-bold ${status === "streaming" ? "text-green-400" : status === "complete" ? "text-blue-400" : "text-gray-400"}`}>
                            {status.toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Control & Network Logs */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">SSE Server Endpoint</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                            />
                            <button
                                onClick={runDemo}
                                disabled={status === "connecting" || status === "streaming"}
                                className="w-full bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {status === "connecting" || status === "streaming" ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Connecting...
                                    </>
                                ) : "Start Handshake"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-3xl h-[600px] flex flex-col overflow-hidden">
                        <div className="bg-gray-900/80 px-4 py-3 text-[10px] font-bold text-gray-400 flex justify-between items-center border-b border-gray-800 tracking-widest">
                            <span>NETWORK LOGS</span>
                            {status === "streaming" && <span className="flex items-center gap-2"><span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> <span className="text-green-500">POLLING</span></span>}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[12px]">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-gray-600 shrink-0 select-none">[{i + 1}]</span>
                                    <span className={`${log.includes("❌") ? "text-red-400" : log.includes("📡") ? "text-blue-400" : log.includes("✨") || log.includes("✅") ? "text-emerald-400" : "text-gray-300"}`}>
                                        {log.includes("]") ? log.split("] ")[1] : log}
                                    </span>
                                </div>
                            ))}
                            {status === "idle" && <div className="text-gray-600 italic">Ready to connect...</div>}
                        </div>
                    </div>
                </div>

                {/* Middle: Protocol Inspector */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl h-[780px] flex flex-col overflow-hidden backdrop-blur-sm">
                        <div className="bg-gray-900/80 px-5 py-4 border-b border-gray-800">
                            <h2 className="text-sm font-black flex items-center gap-2 tracking-widest uppercase">
                                <span className="text-emerald-400">●</span> Protocol Inspector
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {!capabilities ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 text-center px-8">
                                    <div className="w-12 h-12 border-2 border-dashed border-gray-800 rounded-2xl mb-4 flex items-center justify-center text-xl">⌘</div>
                                    <p className="text-xs font-medium">Server capabilities will appear here after the initial handshake.</p>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <section>
                                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">What are Capabilities?</h3>
                                        <div className="text-[11px] text-gray-400 leading-relaxed mb-4">
                                            The `capabilities` object defines which MCP features the server supports (Tools, Resources, Prompts, etc.).
                                        </div>
                                        <div className="bg-black/50 border border-gray-800 p-4 rounded-2xl overflow-x-auto">
                                            <pre className="text-[10px] text-emerald-500 leading-tight">
                                                {JSON.stringify(capabilities, null, 2)}
                                            </pre>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Handshake Logic</h3>
                                        <div className="space-y-4">
                                            {[
                                                { step: "Initialize", desc: "Negotiates protocol version and shares client info." },
                                                { step: "Initialized", desc: "Confirmation that the client has received the capabilities." },
                                                { step: "Discovery", desc: "Request the tools the server is capable of providing." }
                                            ].map((h, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="text-[10px] font-bold text-gray-600 w-4">{i + 1}</div>
                                                    <div>
                                                        <div className="text-[11px] font-bold text-gray-200">{h.step}</div>
                                                        <div className="text-[10px] text-gray-500 mt-1">{h.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Discovered Tools */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl h-[780px] flex flex-col overflow-hidden backdrop-blur-sm">
                        <div className="bg-gray-900/80 px-5 py-4 border-b border-gray-800 flex justify-between items-center text-blue-400">
                            <h2 className="text-sm font-black flex items-center gap-2 tracking-widest uppercase">
                                <span className="text-blue-400">◈</span> Discovered Tools
                            </h2>
                            {tools.length > 0 && <span className="text-[10px] font-black bg-blue-500/20 px-2 py-0.5 rounded-full">{tools.length}</span>}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {tools.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 text-center px-8">
                                    <div className="w-12 h-12 border-2 border-dashed border-gray-800 rounded-2xl mb-4 flex items-center justify-center text-xl">⚙</div>
                                    <p className="text-xs font-medium">Tools listed in the server will populate here once discovered.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tools.map((tool, i) => (
                                        <div key={i} className="bg-black/40 border border-gray-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all group">
                                            <div className="font-bold text-sm text-blue-400 mb-1 group-hover:text-blue-300 transition-colors uppercase">{tool.name}</div>
                                            <div className="text-[11px] text-gray-500 leading-relaxed mb-4">{tool.description}</div>

                                            <div className="pt-3 border-t border-gray-800/50">
                                                <div className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-2">Parameters</div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.entries(tool.inputSchema?.properties || {}).map(([key, val]: any) => (
                                                        <div key={key} className="flex justify-between items-center bg-gray-950/50 px-3 py-1.5 rounded-lg border border-gray-900">
                                                            <span className="text-[10px] font-bold text-emerald-500">{key}</span>
                                                            <span className="text-[9px] text-gray-600 italic text-right">{val.type || "any"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
