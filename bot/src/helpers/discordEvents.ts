import { Embed } from 'discord-rose'
import { WorkerManager } from '../managers/Worker'

import { PunishmentType } from 'typings'
import Wait from '../utils/Wait'

const unavailables = new Set()

export function setupDiscord (worker: WorkerManager): void {
  worker.on('GUILD_CREATE', async (guild) => {
    if (unavailables.has(guild.id)) return unavailables.delete(guild.id)

    worker.log(`Guild added ${guild.id}`)

    await Wait(2000)

    const links = worker.config.links
    if (guild.system_channel_id) {
      if (!worker.hasPerms(guild.id, 'sendMessages', guild.system_channel_id)) return
      if (!worker.hasPerms(guild.id, 'embed', guild.system_channel_id)) return void worker.api.messages.send(guild.system_channel_id, 'Missing `Embed Links` permission. This will likely cause issues with the functionality of the bot.')

      const perms = worker.config.requiredPermissions.filter(x => x.vital && !worker.hasPerms(guild.id, x.permission))
      const embed = new Embed()
        .color(worker.responses.color)
        .title('Thanks for inviting Censor Bot!')
        .field('Enjoy!', `The dashboard: ${links.dashboard}\n[Website](${links.site}) | [Support](${links.support})`)

      if (perms.length > 0) embed.field('Missing a few permissions!', `Some vital permissions are missing:\n${perms.map(x => `\`${x.name}\``).join(', ')}\nType +permissions to see why we need them and recheck them.`)
      else embed.field('Permissions', 'To debug and check your permissions run `+debug`')

      void worker.api.messages.send(guild.system_channel_id, embed)
    }
  })
  worker.on('GUILD_UNAVAILABLE', (guild) => {
    unavailables.add(guild?.id)

    worker.log(`Guild unavailable ${guild}`)
  })
  worker.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.log(`Guild removed ${guild.id}`)
  })
  worker.on('READY', () => {
    void worker.punishments.timeouts.checkTimeouts()

    if (worker.config.custom.allowedGuilds) {
      worker.guilds.forEach(guild => {
        if (!worker.config.custom.allowedGuilds?.includes(guild.id)) {
          void worker.api.guilds.leave(guild.id)
        }
      })
    }
  })
  worker.on('GUILD_CREATE', (guild) => {
    if (worker.config.custom.allowedGuilds && !worker.config.custom.allowedGuilds.includes(guild.id)) {
      void worker.api.guilds.leave(guild.id)
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  worker.on('GUILD_MEMBER_UPDATE', async (member) => {
    if (!member.user) return

    const db = await worker.db.config(member.guild_id)

    if (!db.punishment.role || db.punishment.type !== PunishmentType.Mute) return

    if (member.roles.includes(db.punishment.role)) return

    const punishment = await worker.punishments.timeouts.db.findOne({ guild: member.guild_id, user: member.user.id })
    if (!punishment) return

    void worker.punishments.unmute(member.guild_id, member.user.id, true, punishment.roles)
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  worker.on('GUILD_MEMBER_ADD', async (member) => {
    if (!member.user) return

    const db = await worker.db.config(member.guild_id)

    if (!db.punishment.role || db.punishment.type !== PunishmentType.Mute) return

    const punishment = await worker.punishments.timeouts.db.findOne({ guild: member.guild_id, user: member.user.id })
    if (!punishment) return

    void worker.api.members.addRole(member.guild_id, member.user.id, db.punishment.role)
  })
}
