# 🤖 PayTrack Telegram Bot Setup Guide

This guide will help you set up the Telegram bot integration for your PayTrack MERN application using **Telegram username authentication**.

## 📋 Prerequisites

- Node.js and npm installed
- MongoDB running
- Telegram account with username set
- Basic understanding of Telegram Bot API

## 🚀 Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send the command**: `/newbot`
4. **Choose a name** for your bot (e.g., "PayTrack Manager")
5. **Choose a username** (must end with 'bot', e.g., "paytrack_manager_bot")
6. **Save the bot token** that BotFather provides

## 🔧 Step 2: Configure Environment Variables

1. **Navigate to your backend directory**:
   ```bash
   cd backend
   ```

2. **Copy the environment file**:
   ```bash
   cp env.example .env
   ```

3. **Edit `.env`** and add your Telegram bot token:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/paytrack
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   TELEGRAM_BOT_TOKEN=your-actual-bot-token-here
   ```

## 📦 Step 3: Install Dependencies

1. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

## 🗄️ Step 4: Database Setup

The bot will automatically create the necessary collections when it starts. Make sure your MongoDB is running:

```bash
# Start MongoDB (if using Docker)
docker-compose up -d

# Or start MongoDB service
sudo systemctl start mongod
```

## 🚀 Step 5: Start the Application

1. **Start the backend** (includes Telegram bot):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify bot is running** - you should see:
   ```
   🚀 PayTrack Backend running on port 5000
   🤖 Telegram Bot started successfully!
   ```

## 🔐 Step 6: User Registration (Required for Bot Access)

1. **Open your web application** and log in
2. **Navigate to Profile page** (`/profile`)
3. **Add your Telegram username** (without @ symbol)
4. **Click Update** to save to database
5. **Verify the username is saved** successfully

## 📱 Step 7: Test the Bot

1. **Open Telegram** and search for your bot username
2. **Start the bot** by sending `/start`
3. **The bot will automatically authenticate** using your Telegram username
4. **If authenticated successfully**, you'll see the command menu
5. **If not authenticated**, follow the instructions to add your username on the website

## 📋 Available Bot Commands

Once authenticated, users can use these commands:

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Initialize bot and authenticate | `/start` |
| `/summary` | View analytics summary | `/summary` |
| `/workers` | List all workers | `/workers` |
| `/addworker` | Add new worker | `/addworker` |
| `/payworker` | Record worker payment | `/payworker` |
| `/crops` | List agriculture records | `/crops` |
| `/addcrop` | Add new cultivation | `/addcrop` |
| `/properties` | List real estate records | `/properties` |
| `/addproperty` | Add new property | `/addproperty` |

## 🔐 Authentication Flow

1. **User adds Telegram username** on website profile
2. **User starts bot** with `/start` command
3. **Bot extracts username** from `msg.from.username`
4. **Bot searches database** for matching `telegramUsername`
5. **If found**: Grant access and show commands
6. **If not found**: Show registration instructions

## 🛠️ Customization Options

### Change Bot Responses
Edit `backend/src/bot/telegramBot.ts` to customize:
- Welcome messages
- Command responses
- Error messages
- Keyboard layouts

### Add New Commands
1. Add command handler in `telegramBot.ts`
2. Update the command list in the welcome message
3. Add corresponding keyboard button

### Modify User Interface
Edit `frontend/src/pages/Profile.tsx` to:
- Change validation rules
- Modify UI layout
- Add additional fields

## 🔒 Security Features

- **Telegram username authentication** required for bot access
- **JWT authentication** for web API
- **Username uniqueness** validation
- **Input sanitization** (only alphanumeric + underscore)
- **Role-based access** (admin/user)

## 🚨 Troubleshooting

### Bot Not Starting
- Check `TELEGRAM_BOT_TOKEN` in `.env`
- Verify MongoDB connection
- Check console for error messages

### Authentication Fails
- Ensure Telegram username is set on web profile
- Check username format (no @ symbol)
- Verify username matches exactly

### Commands Not Working
- Check if user is authenticated
- Verify Telegram username in database
- Check MongoDB connection

### Username Validation Issues
- Username must be 3-32 characters
- Only letters, numbers, and underscores allowed
- No @ symbol at the beginning

## 📱 Production Considerations

1. **Add rate limiting** to prevent abuse
2. **Implement logging** for bot interactions
3. **Add error monitoring** (Sentry, LogRocket)
4. **Set up webhook** instead of polling for production
5. **Add admin commands** for user management
6. **Implement user analytics** and usage tracking

## 🔗 Useful Links

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running and accessible
4. Check Telegram bot token validity
5. Verify Telegram username format and uniqueness

## 🎯 Key Benefits of Username Authentication

✅ **No phone number required**  
✅ **Instant authentication**  
✅ **Secure and reliable**  
✅ **Easy to manage**  
✅ **No SMS costs**  
✅ **Better user experience**  

---

**Happy Botting! 🤖✨** 