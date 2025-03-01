import DotEnv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { PermissionsUtils } from 'discord-rose'
import { OAuth2Scopes, Snowflake } from 'discord-api-types'

if (!process.env.BOT_TOKEN) {
  const env = DotEnv.parse(fs.readFileSync(path.resolve(__dirname, '../../.env')))
  Object.keys(env).forEach(key => {
    process.env[key] = env[key]
  })
}

const staging = Boolean(process.env.STAGING)

function generateWebhook (wh: string): { id: Snowflake, token: string } {
  const [id, token] = process.env[`WH_${wh.toUpperCase()}`]?.split(',') as [Snowflake, string]

  return { id, token }
}

export const Config = {
  id: process.env.ID as string,
  dbl: process.env.DBL_TOKEN as string,
  token: process.env.BOT_TOKEN as string,
  db: {
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string
  },

  staging,

  channels: staging
    ? {
        tickets: '841417190635732992'
      }
    : {
        tickets: '691690998115467274'
      },

  emojis: {
    yes: '466027045021941761',
    no: '466027079536738304'
  },

  chargebee: {
    key: process.env.CHARGEBEE as string,
    webhook: process.env.CHARGEBEE_WEBHOOK as string
  },

  premiumAmounts: {
    premium: 3,
    'super-premium': 6,
    'own-instance': 6
  },

  oauth: {
    mySecret: process.env.OAUTH_MYSECRET as string,
    secret: process.env.OAUTH_TOKEN as string
  },

  requiredPermissions: [
    {
      permission: 'sendMessages',
      name: 'Send Messages',
      why: 'To send messages',
      vital: true
    },
    {
      permission: 'embed',
      name: 'Embed Links',
      why: 'To send embeds like this one!',
      vital: true
    },
    {
      permission: 'manageMessages',
      name: 'Manage Messages',
      why: 'To delete messages and message reactions',
      vital: true
    },
    {
      permission: 'manageNicknames',
      name: 'Manage Nicknames',
      why: 'To remove innapropriate nicknames',
      vital: true
    },
    {
      permission: 'manageRoles',
      name: 'Manage Roles',
      why: 'To distribute muted roles with punishments'
    },
    {
      permission: 'kick',
      name: 'Kick Members',
      why: 'To kick members with punishments'
    },
    {
      permission: 'ban',
      name: 'Ban Members',
      why: 'To ban members with punishments'
    },
    {
      permission: 'webhooks',
      name: 'Manage Webhooks',
      why: 'To create resend webhooks (premium)'
    }
  ] as Array<{
    permission: keyof typeof PermissionsUtils.bits
    name: string
    why: string
    vital?: boolean
  }>,

  links: {
    site: 'https://censor.bot',
    invite: 'https://censor.bot/invite',
    dashboard: 'https://dash.censor.bot',
    support: 'https://discord.gg/CRAbk4w',
    premium: 'https://censor.bot/premium'
  },

  defaultMessage: "You're not allowed to say that.",

  webhooks: {
    tickets: generateWebhook('tickets'),
    ticketLog: generateWebhook('ticketLog'),
    errors: generateWebhook('errors')
  },

  actionRetention: 3,

  dashboardOptions: {
    wipeTimeout: 15 * 60 * 1000, // 15 minutes
    requiredPermission: 'manageGuild' as keyof typeof PermissionsUtils.bits,
    scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
    port: Number(process.env.PORT)
  },

  custom: {
    on: Boolean(process.env.CUSTOM),
    lock: Boolean(process.env.LOCK_COMMANDS),
    allowedGuilds: process.env.ALLOWED_GUILDS?.split(','),
    status: process.env.CUSTOM_STATUS?.split(',') as ['playing' | 'streaming' | 'listening' | 'watching' | 'competing', string]
  },

  ai: {
    predictionMin: 0.85, // 85%
    cacheWipe: 10 * 60 * 100, // 10 minutes
    perspectiveKey: process.env.PERSPECTIVE_KEY,
    antiNsfwKey: process.env.ANTI_NSFW_KEY,
    ocrToken: process.env.OCR_KEY as string
  }
}
