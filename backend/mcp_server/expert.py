from mcp.server.fastmcp import FastMCP

# Create a knowledge-based MCP server
mcp = FastMCP("Better-Auth Expert")

@mcp.tool()
def explain_plugin(plugin_name: str):
    """Explain how a Better-Auth plugin works.
    
    Args:
        plugin_name: The name of the plugin (e.g., 'email-password', 'organization')
    """
    plugins = {
        "email-password": "Email and Password plugin allows users to sign up and sign in using their email and a secure password. It handles hashing and verification automatically.",
        "organization": "The Organization plugin adds multi-tenancy support, allowing users to create and join organizations with role-based access control.",
        "two-factor": "Two-factor authentication adds an extra layer of security via TOTP, SMS, or email codes.",
        "social": "Supports OAuth2 providers like Google, GitHub, Discord, etc."
    }
    return plugins.get(plugin_name.lower(), f"I don't have detailed info on '{plugin_name}', but Better-Auth supports many plugins!")

@mcp.tool()
def get_setup_tips():
    """Get expert tips for setting up Better-Auth."""
    return (
        "1. Always use a strong BETTER_AUTH_SECRET.\n"
        "2. Place the auth API route at /api/auth/[...better-auth].\n"
        "3. Use the Prisma adapter for robust database persistence.\n"
        "4. Enable 'emailAndPassword' in your auth config to get started quickly."
    )

if __name__ == "__main__":
    mcp.run()
