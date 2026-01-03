import asyncio
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.sse import sse_client

async def run_project_mcp():
    """Demo 1: Functional MCP - Listens to OUR project's songs database."""
    print("\n" + "🌟" * 25)
    print("DEMO 1: LOCAL PROJECT MCP SERVER")
    print("Goal: Access our app's database via MCP")
    print("🌟" * 25)
    
    server_params = StdioServerParameters(
        command=sys.executable,
        args=[os.path.join(os.path.dirname(__file__), "mcp_server", "server.py")],
        env=os.environ
    )
    
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                print("✅ Connected to Local Song Manager!")
                
                # Call a project-specific tool
                print("\nCalling tool: list_songs...")
                result = await session.call_tool("list_songs")
                print(result.content[0].text)
                
                return True
    except Exception as e:
        print(f"❌ Project MCP failed: {e}")
        return False

async def run_expert_mcp():
    """Demo 2: Ecosystem Knowledge - A local 'Expert' server with Better-Auth knowledge."""
    print("\n" + "🌍" * 25)
    print("DEMO 2: BETTER-AUTH EXPERT (KNOWLEDGE)")
    print("Goal: Access framework documentation/tips via MCP")
    print("🌍" * 25)
    
    server_params = StdioServerParameters(
        command=sys.executable,
        args=[os.path.join(os.path.dirname(__file__), "mcp_server", "expert.py")],
        env=os.environ
    )
    
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                print("✅ Connected to Better-Auth Expert (Local Documentation)!")
                
                # Fetch expert tips
                print("\nCalling tool: get_setup_tips...")
                result = await session.call_tool("get_setup_tips")
                print(f"💡 Expert Wisdom:\n{result.content[0].text}")
                
                # Ask about a specific plugin
                print("\nCalling tool: explain_plugin (email-password)...")
                result = await session.call_tool("explain_plugin", {"plugin_name": "email-password"})
                print(f"📘 Info: {result.content[0].text}")
                
                return True
    except Exception as e:
        print(f"❌ Expert MCP failed: {e}")
        return False

async def main():
    print("🚀 STARTING BETTER-AUTH MCP SHOWCASE 🚀")
    print("-" * 50)
    
    # Run Demo 1
    success1 = await run_project_mcp()
    
    print("\n" + "=" * 50)
    
    # Run Demo 2
    success2 = await run_expert_mcp()
    
    print("\n" + "-" * 50)
    if success1 and success2:
        print("✅ ALL MCP DEMOS COMPLETED SUCCESSFULLY!")
    else:
        print("⚠️ SOME DEMOS FAILED - Check the logs above.")
    print("🚀 SHOWCASE COMPLETE 🚀")

if __name__ == "__main__":
    asyncio.run(main())
