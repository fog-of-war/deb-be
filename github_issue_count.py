import os
import requests
import discord
from discord.ext import commands
from datetime import datetime

# Set GitHub API token and Discord bot token from environment variables
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
DISCORD_BOT_TOKEN = os.environ["DISCORD_BOT_TOKEN"]
DISCORD_CHANNEL_ID = os.environ["DISCORD_CHANNEL_ID"]

# Create a Discord bot client with default intents
intents = discord.Intents.default()
client = discord.Client(intents=intents)

# Function to send GitHub issue count to Discord
async def send_github_issue_count_once():
    # Retrieve GitHub issues
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}"
    }
    response = requests.get("https://api.github.com/repos/fog-of-war/dev-fe/issues", headers=headers)
    if response.status_code == 200:
        issues = response.json()
        assignee_count = {}
        current_date = datetime.now().strftime("%Y-%m-%d")

        for issue in issues:
            assignee = issue["assignee"]["login"] if issue["assignee"] else "담당자 없음"
            if assignee in assignee_count:
                assignee_count[assignee] += 1
            else:
                assignee_count[assignee] = 1

        # Send the message to the Discord channel
        channel = client.get_channel(int(DISCORD_CHANNEL_ID))

        # Create the message
        message = f"## 📅 **{current_date}**\n"
        for assignee, count in assignee_count.items():
            message += f"💡 **{assignee}**: {count}개의 이슈가 남아있습니다.\n"
            
            code_block = "```md\n"
            for issue in issues:
                if issue["assignee"] and issue["assignee"]["login"] == assignee:
                    issue_title = issue["title"]
                    code_block += f"{issue_title}\n"
            code_block += "```"
            
            message += code_block
            message += "\n"

        await channel.send(message)

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')
    
    # Run the function once when the bot starts
    await send_github_issue_count_once()
    
    # Close the bot when the task is done
    await client.close()

# Run the bot
client.run(DISCORD_BOT_TOKEN)
