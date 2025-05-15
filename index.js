const { session, Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  console.error("BOT_TOKEN is not defined in the environment variables.");
  process.exit(1); // Exit the process if the bot token is missing
}

const bot = new Telegraf(botToken);

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  console.log(userId);
  const refId = ctx.payload; // Use `startPayload` for the referral payload in `telegraf`

  console.log("Referral ID:", refId);

  if (refId) {
    const isValidReferral = await validateReferralId(refId);

    if (isValidReferral) {
      console.log(
        `Referral ID ${refId} is valid. Proceed with referral logic.`
      );
      ctx.replyWithHTML(
        `Welcome to KingPar ${ctx.from.username} \n\n <b>You were referred by ${isValidReferral.username}</b> \n\nLaunch the app by clicking the launch button`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                Markup.button.webApp(
                  "Launch",
                  `https://kingpar.vercel.app?referralCode=${refId}`
                ),
              ],
            ],
          },
        }
      );
    } else {
      console.log(`Referral ID ${refId} is not valid.`);
      ctx.replyWithHTML(
        `Welcome to Kingpar bot ${ctx.from.username} \n\n <b>Your referral Link is invalid!!</b> \n\n Launch the app by clicking the launch button`,
        {
          reply_markup: {
            inline_keyboard: [
              [Markup.button.webApp("Launch", `https://kingpar.vercel.app/`)],
            ],
          },
        }
      );
    }
  } else {
    console.log("No referral ID provided.");
    ctx.reply(
      `Welcome to KingPar bot ${ctx.from.username} \n\n Launch the app by clicking the launch button`,
      {
        reply_markup: {
          inline_keyboard: [
            [Markup.button.webApp("Launch", `https://kingpar.vercel.app/`)],
          ],
        },
      }
    );
  }
});

// Function to validate a referral ID
const validateReferralId = async (refId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: refId },
    });
    console.log(user);
    return user;
  } catch (error) {
    console.error("Error validating referral ID:", error);
    return false;
  }
};

// Launch the bot
bot.launch({
    webhook: {
        domain: 'https://kingbot-s1i0.onrender.com',
        port: process.env.PORT || 3000,
    },
});

console.log("Bot is running...");
