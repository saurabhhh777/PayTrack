import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User';
import Worker from '../models/Worker';
import Payment from '../models/Payment';
import Cultivation from '../models/Cultivation';
import Property from '../models/Property';
import Attendance from '../models/Attendance';
import { connectDB } from '../config/database';

interface BotUser {
  chatId: number;
  userId?: string;
  isAuthenticated: boolean;
  currentCommand?: string;
  tempData: any;
}

class VeeraBookBot {
  private bot: TelegramBot;
  private users: Map<number, BotUser> = new Map();
  private isConnected: boolean = false;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, this.handleStart.bind(this));

    // Handle text messages for commands
    this.bot.on('message', this.handleMessage.bind(this));

    // Handle commands
    this.bot.onText(/\/workers/, this.handleWorkers.bind(this));
    this.bot.onText(/\/addworker/, this.handleAddWorker.bind(this));
    this.bot.onText(/\/payworker/, this.handlePayWorker.bind(this));
    this.bot.onText(/\/crops/, this.handleCrops.bind(this));
    this.bot.onText(/\/addcrop/, this.handleAddCrop.bind(this));
    this.bot.onText(/\/properties/, this.handleProperties.bind(this));
    this.bot.onText(/\/addproperty/, this.handleAddProperty.bind(this));
    this.bot.onText(/\/summary/, this.handleSummary.bind(this));
    
    // Attendance commands
    this.bot.onText(/\/addattendance/, this.handleAddAttendance.bind(this));
    this.bot.onText(/\/attendance/, this.handleAttendance.bind(this));
    this.bot.onText(/\/attendancesummary/, this.handleAttendanceSummary.bind(this));
    


    // Handle errors
    this.bot.on('error', (error) => {
      console.error('Telegram Bot Error:', error);
    });

    this.bot.on('polling_error', (error) => {
      console.error('Telegram Bot Polling Error:', error);
    });
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const telegramUsername = msg.from?.username;

    if (!telegramUsername) {
      await this.bot.sendMessage(chatId, 
        '❌ You need a Telegram username to use this bot. Please set a username in your Telegram settings first.'
      );
      return;
    }

    try {
      // Find user with matching Telegram username
      const user = await User.findOne({ telegramUsername });

      if (user) {
        const botUser = this.users.get(chatId) || { chatId, isAuthenticated: false, tempData: {} };
        botUser.userId = user._id?.toString() || '';
        botUser.isAuthenticated = true;
        this.users.set(chatId, botUser);

        const successMessage = `
✅ Authentication successful!

Welcome back, ${user.username}! 

Available commands:
📊 /summary - View analytics summary
👥 /workers - List all workers
➕ /addworker - Add new worker
💰 /payworker - Record payment
🌾 /crops - List agriculture records
🌱 /addcrop - Add new cultivation
🏠 /properties - List real estate records
🏗️ /addproperty - Add new property
        `;

        const keyboard = {
          keyboard: [
            [{ text: '📊 /summary' }, { text: '👥 /workers' }],
            [{ text: '➕ /addworker' }, { text: '💰 /payworker' }],
            [{ text: '🌾 /crops' }, { text: '🌱 /addcrop' }],
            [{ text: '🏠 /properties' }, { text: '🏗️ /addproperty' }],
            [{ text: '📅 /addattendance' }, { text: '📋 /attendance' }],
            [{ text: '📊 /attendancesummary' }]
          ],
          resize_keyboard: true
        };

        await this.bot.sendMessage(chatId, successMessage, { reply_markup: keyboard });
      } else {
        const errorMessage = `
❌ Authentication failed!

You are not registered. Please add your Telegram username in your website profile first.

Your Telegram username: @${telegramUsername}

Steps to register:
1. Go to your VeeraBook profile page
2. Add your Telegram username: ${telegramUsername}
3. Try /start again
        `;

        await this.bot.sendMessage(chatId, errorMessage);
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      await this.bot.sendMessage(chatId, '❌ An error occurred during authentication. Please try again.');
    }
  }

  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user || !user.isAuthenticated) {
      await this.bot.sendMessage(chatId, 'Please use /start to begin authentication.');
      return;
    }

    // Handle command inputs based on current command
    if (user.currentCommand) {
      await this.handleCommandInput(msg);
    }
  }

  private async handleCommandInput(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    if (!user) return;

    // Handle different command inputs
    switch (user.currentCommand) {
      case 'add_worker_name':
        user.tempData.workerName = msg.text;
        user.currentCommand = 'add_worker_phone';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📱 Enter worker phone number (required):');
        break;
      
      case 'add_worker_phone':
        user.tempData.workerPhone = msg.text;
        user.currentCommand = 'add_worker_salary';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '💰 Enter monthly salary in rupees (required):');
        break;

      case 'add_worker_salary':
        const salary = parseFloat(msg.text || '0');
        if (isNaN(salary) || salary <= 0) {
          await this.bot.sendMessage(chatId, '❌ Please enter a valid salary amount (greater than 0). Try again:');
          return;
        }
        user.tempData.workerSalary = salary;
        user.currentCommand = 'add_worker_address';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '🏠 Enter worker address (optional - type "none" to skip):');
        break;

      case 'add_worker_address':
        user.tempData.workerAddress = msg.text?.toLowerCase() === 'none' ? '' : msg.text;
        user.currentCommand = 'add_worker_joining_date';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📅 Enter joining date (optional - type "today" for current date, or enter date like "15/12/2024"):');
        break;

      case 'add_worker_joining_date':
        let joiningDate = new Date();
        if (msg.text?.toLowerCase() !== 'today') {
          const dateInput = msg.text;
          if (dateInput && dateInput !== 'none') {
            // Try to parse date in DD/MM/YYYY format
            const dateParts = dateInput.split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const year = parseInt(dateParts[2]);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                joiningDate = new Date(year, month, day);
              }
            }
          }
        }
        user.tempData.workerJoiningDate = joiningDate;
        user.currentCommand = 'add_worker_notes';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📝 Enter additional notes (optional - type "none" to skip):');
        break;

      case 'add_worker_notes':
        user.tempData.workerNotes = msg.text?.toLowerCase() === 'none' ? '' : msg.text;
        await this.addWorkerToDatabase(chatId, user);
        break;

      case 'add_crop_name':
        user.tempData.cropName = msg.text;
        user.currentCommand = 'add_crop_area';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📏 Enter crop area in Bigha (required):');
        break;

      case 'add_crop_area':
        const area = parseFloat(msg.text || '0');
        if (isNaN(area) || area <= 0) {
          await this.bot.sendMessage(chatId, '❌ Please enter a valid area (greater than 0). Try again:');
          return;
        }
        user.tempData.cropArea = area;
        user.currentCommand = 'add_crop_rate';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '💰 Enter rate per Bigha in rupees (required):');
        break;

      case 'add_crop_rate':
        const rate = parseFloat(msg.text || '0');
        if (isNaN(rate) || rate <= 0) {
          await this.bot.sendMessage(chatId, '❌ Please enter a valid rate (greater than 0). Try again:');
          return;
        }
        user.tempData.cropRate = rate;
        user.currentCommand = 'add_crop_payment_mode';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '💳 Enter payment mode (required: type "cash" or "UPI"):');
        break;

      case 'add_crop_payment_mode':
        const paymentMode = msg.text?.toLowerCase();
        if (paymentMode !== 'cash' && paymentMode !== 'upi') {
          await this.bot.sendMessage(chatId, '❌ Please enter either "cash" or "UPI". Try again:');
          return;
        }
        user.tempData.cropPaymentMode = paymentMode;
        user.currentCommand = 'add_crop_buyer';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '👤 Enter buyer name (optional - type "none" to skip):');
        break;

      case 'add_crop_buyer':
        user.tempData.cropBuyer = msg.text?.toLowerCase() === 'none' ? '' : msg.text;
        user.currentCommand = 'add_crop_amount_received';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '💰 Enter amount received (optional - type "0" if none):');
        break;

      case 'add_crop_amount_received':
        const amountReceived = parseFloat(msg.text || '0');
        if (isNaN(amountReceived) || amountReceived < 0) {
          await this.bot.sendMessage(chatId, '❌ Please enter a valid amount (0 or greater). Try again:');
          return;
        }
        user.tempData.cropAmountReceived = amountReceived;
        user.currentCommand = 'add_crop_harvest_date';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📅 Enter harvest date (optional - type "none" to skip, or enter date like "15/12/2024"):');
        break;

      case 'add_crop_harvest_date':
        let harvestDate = undefined;
        if (msg.text?.toLowerCase() !== 'none') {
          const dateInput = msg.text;
          if (dateInput) {
            // Try to parse date in DD/MM/YYYY format
            const dateParts = dateInput.split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const year = parseInt(dateParts[2]);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                harvestDate = new Date(year, month, day);
              }
            }
          }
        }
        user.tempData.cropHarvestDate = harvestDate;
        user.currentCommand = 'add_crop_notes';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📝 Enter additional notes (optional - type "none" to skip):');
        break;

      case 'add_crop_notes':
        user.tempData.cropNotes = msg.text?.toLowerCase() === 'none' ? '' : msg.text;
        await this.addCropToDatabase(chatId, user);
        break;

      case 'add_property_type':
        user.tempData.propertyType = msg.text;
        user.currentCommand = 'add_property_value';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '💰 Enter property total cost:');
        break;

      case 'add_property_value':
        user.tempData.propertyValue = parseFloat(msg.text || '0');
        await this.addPropertyToDatabase(chatId, user);
        break;

      // Attendance command inputs
      case 'add_attendance_worker':
        const workerName = msg.text;
        if (!workerName) {
          await this.bot.sendMessage(chatId, '❌ Please enter a worker name:');
          return;
        }
        const worker = await Worker.findOne({ name: { $regex: new RegExp(workerName, 'i') } });
        
        if (!worker) {
          await this.bot.sendMessage(chatId, '❌ Worker not found. Please enter a valid worker name:');
          return;
        }
        
        user.tempData.workerId = worker._id;
        user.tempData.workerName = worker.name;
        user.currentCommand = 'add_attendance_date';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, `📅 Enter date for ${worker.name} (type "today" for current date, or enter date like "15/12/2024"):`);
        break;

      case 'add_attendance_date':
        let attendanceDate = new Date();
        if (msg.text?.toLowerCase() !== 'today') {
          const dateInput = msg.text;
          if (dateInput) {
            // Try to parse date in DD/MM/YYYY format
            const dateParts = dateInput.split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const year = parseInt(dateParts[2]);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                attendanceDate = new Date(year, month, day);
              }
            }
          }
        }
        user.tempData.attendanceDate = attendanceDate;
        user.currentCommand = 'add_attendance_status';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📊 Enter attendance status (required: type "Present", "Absent", or "HalfDay"):');
        break;

      case 'add_attendance_status':
        const status = msg.text;
        if (!status || !['Present', 'Absent', 'HalfDay'].includes(status)) {
          await this.bot.sendMessage(chatId, '❌ Please enter either "Present", "Absent", or "HalfDay". Try again:');
          return;
        }
        user.tempData.attendanceStatus = status;
        user.currentCommand = 'add_attendance_notes';
        this.users.set(chatId, user);
        await this.bot.sendMessage(chatId, '📝 Enter notes (optional - type "none" to skip):');
        break;

      case 'add_attendance_notes':
        user.tempData.attendanceNotes = msg.text?.toLowerCase() === 'none' ? '' : msg.text;
        await this.addAttendanceToDatabase(chatId, user);
        break;

      case 'view_attendance_worker':
        const searchWorkerName = msg.text;
        if (!searchWorkerName) {
          await this.bot.sendMessage(chatId, '❌ Please enter a worker name:');
          return;
        }
        const searchWorker = await Worker.findOne({ name: { $regex: new RegExp(searchWorkerName, 'i') } });
        
        if (!searchWorker) {
          await this.bot.sendMessage(chatId, '❌ Worker not found. Please enter a valid worker name:');
          return;
        }
        
        await this.showWorkerAttendance(chatId, searchWorker._id?.toString() || '');
        break;



      default:
        await this.bot.sendMessage(chatId, 'Please use the available commands from the menu.');
    }
  }

  private async addAttendanceToDatabase(chatId: number, user: BotUser) {
    try {
      const { 
        workerId, 
        workerName, 
        attendanceDate, 
        attendanceStatus, 
        attendanceNotes 
      } = user.tempData;
      
      // Check for existing attendance on the same date
      const existingAttendance = await Attendance.findOne({ workerId, date: attendanceDate });
      
      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = attendanceStatus;
        existingAttendance.notes = attendanceNotes;
        await existingAttendance.save();

        const successMessage = `
✅ **Attendance Updated Successfully!**

👤 **Worker:** ${workerName}
📅 **Date:** ${attendanceDate.toLocaleDateString()}
📊 **Status:** ${attendanceStatus}
📝 **Notes:** ${attendanceNotes || 'None'}
🆔 **ID:** ${existingAttendance._id}
        `;

        await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
      } else {
        // Create new attendance
        const newAttendance = new Attendance({
          workerId,
          date: attendanceDate,
          status: attendanceStatus,
          notes: attendanceNotes
        });

        await newAttendance.save();

        const successMessage = `
✅ **Attendance Added Successfully!**

👤 **Worker:** ${workerName}
📅 **Date:** ${attendanceDate.toLocaleDateString()}
📊 **Status:** ${attendanceStatus}
📝 **Notes:** ${attendanceNotes || 'None'}
🆔 **ID:** ${newAttendance._id}
        `;

        await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
      }

      // Reset command state
      user.currentCommand = undefined;
      user.tempData = {};
      this.users.set(chatId, user);
    } catch (error) {
      console.error('Error managing attendance:', error);
      await this.bot.sendMessage(chatId, '❌ Error managing attendance. Please try again.');
    }
  }

  private async showWorkerAttendance(chatId: number, workerId: string) {
    try {
      const worker = await Worker.findById(workerId);
      if (!worker) {
        await this.bot.sendMessage(chatId, '❌ Worker not found.');
        return;
      }

      const attendance = await Attendance.find({ workerId })
        .sort({ date: -1 })
        .limit(20); // Show last 20 records

      if (attendance.length === 0) {
        await this.bot.sendMessage(chatId, `📝 No attendance records found for ${worker.name}.`);
        return;
      }

      let message = `📋 **Attendance History for ${worker.name}**\n\n`;
      
      attendance.forEach((record, index) => {
        const statusEmoji = record.status === 'Present' ? '✅' : 
                           record.status === 'Absent' ? '❌' : '⏰';
        
        message += `${index + 1}. ${statusEmoji} **${record.status}** - ${record.date.toLocaleDateString()}\n`;
        if (record.notes) {
          message += `   📝 ${record.notes}\n`;
        }
        message += '\n';
      });

      // Add summary
      const present = attendance.filter(a => a.status === 'Present').length;
      const absent = attendance.filter(a => a.status === 'Absent').length;
      const halfDay = attendance.filter(a => a.status === 'HalfDay').length;
      const total = attendance.length;
      const attendanceRate = total > 0 ? ((present + halfDay * 0.5) / total * 100).toFixed(1) : '0';

      message += `📊 **Summary:**\n`;
      message += `✅ Present: ${present} | ❌ Absent: ${absent} | ⏰ Half Day: ${halfDay}\n`;
      message += `📈 Attendance Rate: ${attendanceRate}%`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching worker attendance:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching attendance data.');
    }
  }

  

  private async handleWorkers(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    try {
      const workers = await Worker.find().sort({ createdAt: -1 }).limit(10);
      
      if (workers.length === 0) {
        await this.bot.sendMessage(chatId, '📝 No workers found.');
        return;
      }

      let message = '👥 **Workers List**\n\n';
      workers.forEach((worker, index) => {
        message += `${index + 1}. **${worker.name}**\n`;
        message += `   📱 ${worker.phone}\n`;
        message += `   💰 Salary: ₹${worker.salary}\n`;
        message += `   📅 Added: ${new Date(worker.createdAt).toLocaleDateString()}\n\n`;
      });

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching workers:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching workers data.');
    }
  }

  private async handleAddWorker(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    user.currentCommand = 'add_worker_name';
    user.tempData = {};
    this.users.set(chatId, user);

    const welcomeMessage = `
👤 **Adding New Worker**

Let's collect the worker information step by step:

**Required Fields:**
• Name (required)
• Phone (required)
• Monthly Salary (required)

**Optional Fields:**
• Address (optional - enter "none" to skip)
• Joining Date (optional - enter "today" for current date)
• Additional Notes (optional - enter "none" to skip)

Let's start with the **worker name** (required):
    `;

    await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }

  private async addWorkerToDatabase(chatId: number, user: BotUser) {
    try {
      const { 
        workerName, 
        workerPhone, 
        workerSalary, 
        workerAddress, 
        workerJoiningDate, 
        workerNotes 
      } = user.tempData;
      
      const newWorker = new Worker({
        name: workerName,
        phone: workerPhone,
        address: workerAddress || 'Not specified',
        joiningDate: workerJoiningDate || new Date(),
        salary: workerSalary,
        isActive: true,
        notes: workerNotes || 'Added via Telegram Bot'
      });

      await newWorker.save();

      const successMessage = `
✅ **Worker Added Successfully!**

👤 **Name:** ${workerName}
📱 **Phone:** ${workerPhone}
💰 **Salary:** ₹${workerSalary}/month
🏠 **Address:** ${workerAddress || 'Not specified'}
📅 **Joining Date:** ${(workerJoiningDate || new Date()).toLocaleDateString()}
📝 **Notes:** ${workerNotes || 'None'}
🆔 **ID:** ${newWorker._id}
      `;

      await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });

      // Reset command state
      user.currentCommand = undefined;
      user.tempData = {};
      this.users.set(chatId, user);
    } catch (error) {
      console.error('Error adding worker:', error);
      await this.bot.sendMessage(chatId, '❌ Error adding worker. Please try again.');
    }
  }

  private async handlePayWorker(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    try {
      const workers = await Worker.find({ isActive: true });
      
      if (workers.length === 0) {
        await this.bot.sendMessage(chatId, '📝 No active workers found.');
        return;
      }

      let message = '💰 **Select Worker for Payment**\n\n';
      workers.forEach((worker, index) => {
        message += `${index + 1}. **${worker.name}** - ₹${worker.salary}/month\n`;
      });

      message += '\nReply with the worker number to record payment.';
      
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching workers for payment:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching workers data.');
    }
  }

  private async handleCrops(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    try {
      const crops = await Cultivation.find().sort({ createdAt: -1 }).limit(10);
      
      if (crops.length === 0) {
        await this.bot.sendMessage(chatId, '🌾 No cultivation records found.');
        return;
      }

      let message = '🌾 **Agriculture Records**\n\n';
      crops.forEach((crop, index) => {
        message += `${index + 1}. **${crop.cropName}**\n`;
        message += `   📏 Area: ${crop.area} Bigha\n`;
        message += `   💰 Total Cost: ₹${crop.totalCost}\n`;
        message += `   📅 Date: ${new Date(crop.cultivationDate).toLocaleDateString()}\n\n`;
      });

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching crops:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching agriculture data.');
    }
  }

  private async handleAddCrop(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    user.currentCommand = 'add_crop_name';
    user.tempData = {};
    this.users.set(chatId, user);

    const welcomeMessage = `
🌾 **Adding New Crop**

Let's collect the crop information step by step:

**Required Fields:**
• Crop Name (required)
• Area in Bigha (required)
• Rate per Bigha (required)
• Payment Mode (required: cash or UPI)

**Optional Fields:**
• Buyer Name (optional - enter "none" to skip)
• Amount Received (optional - enter "0" if none)
• Harvest Date (optional - enter "none" to skip)
• Notes (optional - enter "none" to skip)

Let's start with the **crop name** (required):
    `;

    await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }

  private async addCropToDatabase(chatId: number, user: BotUser) {
    try {
      const { 
        cropName, 
        cropArea, 
        cropRate, 
        cropPaymentMode, 
        cropBuyer, 
        cropAmountReceived, 
        cropHarvestDate, 
        cropNotes 
      } = user.tempData;
      
      const totalCost = cropArea * cropRate;
      const amountPending = totalCost - cropAmountReceived;
      
      const newCrop = new Cultivation({
        cropName,
        area: cropArea,
        ratePerBigha: cropRate,
        totalCost: totalCost,
        buyerName: cropBuyer || undefined,
        amountReceived: cropAmountReceived,
        amountPending: amountPending,
        paymentMode: cropPaymentMode,
        cultivationDate: new Date(),
        harvestDate: cropHarvestDate,
        notes: cropNotes || 'Added via Telegram Bot'
      });

      await newCrop.save();

      const successMessage = `
✅ **Crop Added Successfully!**

🌾 **Crop:** ${cropName}
📏 **Area:** ${cropArea} Bigha
💰 **Rate per Bigha:** ₹${cropRate}
💰 **Total Cost:** ₹${totalCost}
💳 **Payment Mode:** ${cropPaymentMode.toUpperCase()}
👤 **Buyer:** ${cropBuyer || 'Not specified'}
💰 **Amount Received:** ₹${cropAmountReceived}
💰 **Amount Pending:** ₹${amountPending}
📅 **Harvest Date:** ${cropHarvestDate ? cropHarvestDate.toLocaleDateString() : 'Not specified'}
📝 **Notes:** ${cropNotes || 'None'}
🆔 **ID:** ${newCrop._id}
      `;

      await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });

      // Reset command state
      user.currentCommand = undefined;
      user.tempData = {};
      this.users.set(chatId, user);
    } catch (error) {
      console.error('Error adding crop:', error);
      await this.bot.sendMessage(chatId, '❌ Error adding crop. Please try again.');
    }
  }

  private async handleProperties(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    try {
      const properties = await Property.find().sort({ createdAt: -1 }).limit(10);
      
      if (properties.length === 0) {
        await this.bot.sendMessage(chatId, '🏠 No property records found.');
        return;
      }

      let message = '🏠 **Real Estate Records**\n\n';
      properties.forEach((property, index) => {
        message += `${index + 1}. **${property.propertyType}**\n`;
        message += `   💰 Total Cost: ₹${property.totalCost}\n`;
        message += `   📍 Partner: ${property.partnerName}\n`;
        message += `   📅 Date: ${new Date(property.transactionDate).toLocaleDateString()}\n\n`;
      });

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching properties:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching property data.');
    }
  }

  private async handleAddProperty(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    user.currentCommand = 'add_property_type';
    user.tempData = {};
    this.users.set(chatId, user);

    await this.bot.sendMessage(chatId, '🏠 Enter property type (buy/sell):');
  }

  private async addPropertyToDatabase(chatId: number, user: BotUser) {
    try {
      const { propertyType, propertyValue } = user.tempData;
      
      const newProperty = new Property({
        propertyType: propertyType === 'buy' ? 'buy' : 'sell',
        area: 1, // Default area
        areaUnit: 'Bigha',
        partnerName: 'Added via Telegram Bot',
        ratePerUnit: propertyValue,
        totalCost: propertyValue,
        amountPaid: 0,
        amountPending: propertyValue,
        transactionDate: new Date(),
        notes: 'Added via Telegram Bot'
      });

      await newProperty.save();

      const successMessage = `
✅ **Property Added Successfully!**

🏠 **Type:** ${propertyType}
💰 **Total Cost:** ₹${propertyValue}
📍 **Partner:** Added via Telegram Bot
🆔 **ID:** ${newProperty._id}
      `;

      await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });

      // Reset command state
      user.currentCommand = undefined;
      user.tempData = {};
      this.users.set(chatId, user);
    } catch (error) {
      console.error('Error adding property:', error);
      await this.bot.sendMessage(chatId, '❌ Error adding property. Please try again.');
    }
  }

  private async handleSummary(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    try {
      // Get summary data
      const totalWorkers = await Worker.countDocuments();
      const totalCrops = await Cultivation.countDocuments();
      const totalProperties = await Property.countDocuments();
      const totalPayments = await Payment.countDocuments();

      const summaryMessage = `
📊 **VeeraBook Summary**

👥 **Workers:** ${totalWorkers}
🌾 **Crops:** ${totalCrops}
🏠 **Properties:** ${totalProperties}
💰 **Payments:** ${totalPayments}

Use the commands below to view detailed information:
• /workers - View all workers
• /crops - View agriculture records  
• /properties - View real estate records
        `;

      await this.bot.sendMessage(chatId, summaryMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching summary:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching summary data.');
    }
  }

  // Attendance Commands

  private async handleAddAttendance(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    user.currentCommand = 'add_attendance_worker';
    user.tempData = {};
    this.users.set(chatId, user);

    const welcomeMessage = `
📅 **Adding Attendance Record**

Let's collect the attendance information step by step:

**Required Fields:**
• Worker Name (required)
• Date (required)
• Status (required: Present, Absent, or HalfDay)

**Optional Fields:**
• Notes (optional - type "none" to skip)

Let's start with the **worker name** (required):
    `;

    await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }

  private async handleAttendance(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    user.currentCommand = 'view_attendance_worker';
    user.tempData = {};
    this.users.set(chatId, user);

    await this.bot.sendMessage(chatId, '👤 Enter worker name to view attendance history:');
  }

  private async handleAttendanceSummary(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = this.users.get(chatId);
    
    if (!user?.isAuthenticated) {
      await this.bot.sendMessage(chatId, '❌ Please authenticate first using /start');
      return;
    }

    try {
      const workers = await Worker.find({ isActive: true });
      
      if (workers.length === 0) {
        await this.bot.sendMessage(chatId, '📝 No active workers found.');
        return;
      }

      let message = '📊 **Attendance Summary for All Workers**\n\n';
      
      for (const worker of workers) {
        const attendance = await Attendance.find({ workerId: worker._id });
        
        const present = attendance.filter(a => a.status === 'Present').length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const halfDay = attendance.filter(a => a.status === 'HalfDay').length;
        const total = attendance.length;
        
        const attendanceRate = total > 0 ? ((present + halfDay * 0.5) / total * 100).toFixed(1) : '0';
        
        message += `👤 **${worker.name}**\n`;
        message += `   ✅ Present: ${present} | ❌ Absent: ${absent} | ⏰ Half Day: ${halfDay}\n`;
        message += `   📊 Total Days: ${total} | 📈 Rate: ${attendanceRate}%\n\n`;
      }

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching attendance summary.');
    }
  }

  public async start() {
    try {
      await connectDB();
      this.isConnected = true;
      console.log('🤖 VeeraBook Telegram Bot started successfully!');
    } catch (error) {
      console.error('Failed to start Telegram Bot:', error);
      throw error;
    }
  }

  public stop() {
    if (this.bot) {
      this.bot.stopPolling();
      this.isConnected = false;
      console.log('🤖 VeeraBook Telegram Bot stopped.');
    }
  }

  public isRunning(): boolean {
    return this.isConnected;
  }
}

export default VeeraBookBot; 