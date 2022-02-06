const Discord = require("discord.js");
const {Permissions, Intents, Client} = require("discord.js");
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES]})
const express = require("express");
const app = express();
const db = require("quick.db");

const cooldown = new Set();

const prefix = "-"

app.get("/", (req, res) => {
    res.sendStatus(200);
})

app.listen(3000);

client.on("ready", () => {
console.log("logged into: ", client.user.tag)
})


const ownerID = ['669680044582633474','370828535020912651']
client.on("messageCreate", message => {
  const args = message.content.split(" ").slice(1);
     if(!ownerID.includes(message.author.id)) return;
     if(message.content.startsWith(prefix + "eval")) {
     function clean(text) {
      if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      else
          return text;
    }
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), {code:"xl"}).catch(err=>{
message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
  })


//الحين بنبدا بالاكواد حقت امر الشكر

client.on("messageCreate", message => {
    const user = message.mentions.users.first();
    if(!message.guild || message.author.bot)return;
    if(message.content.startsWith(prefix + "thx")) {
        if(!user)return message.reply("Please mention someone !")
        if(user.bot)return message.reply("You can't thank bots !")
        if(message.author.id === user.id)return message.reply("You can't thank yourself !");
        if(cooldown.has(message.author.id))return message.reply("You are in cooldown for 6 hours !")
        db.add(`thx_${user.id}_${message.guild.id}`, 1)
        let thanksCount = db.fetch(`thx_${user.id}_${message.guild.id}`)
        cooldown.add(message.author.id)
        setTimeout(function() {
            cooldown.delete(message.author.id)
        }, 21600000)
        message.channel.send(`${message.author} has thanked ${user}\n\n${user} you have now ${thanksCount}`)
    }
})

client.on("messageCreate", message => {
    const user = message.mentions.users.first() || message.author;
    if(!message.guild || message.author.bot)return;
    if(message.content.startsWith(prefix + "thanks")) {
        if(user.bot)return message.reply("Bots do not have thanks !")
        let thanksCount = db.fetch(`thx_${user.id}_${message.guild.id}`)
        if(thanksCount === null)return message.reply(`${user} you don't have any thanks !`)
        message.channel.send(`${user} you have ${thanksCount} thanks !`)
    }
})

client.on("messageCreate", message => {
    let points = message.content.split(" ")[2];
    const user = message.mentions.users.first();
    if(!message.guild || message.author.bot)return;
    if(message.content.startsWith(prefix + "point")) {
        if(!user)return message.reply("**Please mention a user**")
        if(!points)return message.reply("**Please type how much points you want to add/remove !**")
        if(isNaN(points))return message.reply("**You can just type numbers ! [\`-,+,1,2,3,4,5,6,7,8,9,0\`]**")
        if(points.includes("/") || points.includes("*"))return message.reply("**You can just type numbers ! [\`-,+,1,2,3,4,5,6,7,8,9,0\`]**")
        if(points.length > 15)return message.reply("Max length for numbers is 15 !")
        if(points.includes("-")) {
            let filterSubtract = points.slice(1);
            filterSubtract = eval(filterSubtract)
            db.subtract(`points_${user.id}_${message.guild.id}`, filterSubtract.toString())
            let userPoints = db.fetch(`points_${user.id}_${message.guild.id}`)
            message.channel.send(`${message.author} removed ${filterSubtract} points from ${user} successfully !\n\n${user} have now ${userPoints} points !`)
        }
        if(points.includes("+")) {
            let filterAdd = points.slice(1);
            filterAdd = eval(filterAdd)
            db.add(`points_${user.id}_${message.guild.id}`, filterAdd.toString())
            let userPoints = db.fetch(`points_${user.id}_${message.guild.id}`)
            message.channel.send(`${message.author} gived ${user} ${filterAdd} points successfully !\n\n${user} have now ${userPoints} points !`)
        }
    }
})

//بسوي كود يطلع عدد النقاط عشان احاول اعرف المشكلة

client.on("messageCreate", message => {
    const user = message.mentions.users.first() || message.author;
    if(!message.guild || message.author.bot)return;
    if(message.content.startsWith(prefix + "upoints")) {
        if(user.bot)return message.reply("I think bots do not have points !!")
        let pointsOfUser = db.fetch(`points_${user.id}_${message.guild.id}`)
        if(pointsOfUser === null)pointsOfUser = "0"
        message.channel.send(`${user} you have ${pointsOfUser} points !`)
        message.channel.send(db.all())
    }
})

client.on("messageCreate", message => {
    if(!message.guild || message.author.bot)return;
    if(message.content.startsWith(prefix + "server")) {
        let s = false;
        let k = ""
        if(message.guild.iconURL() === null)s = true;
        if(s === true)k = "لايوجد"
        if(s === false)k = "ICON URL"
        var embed = new Discord.MessageEmbed()
        .setTitle(`**\`${message.guild.name}\` Info**`)
        .setAuthor({
            name: message.guild.name,
            iconURL: message.guild.iconURL({dynamic: true})
        })
        .setThumbnail(message.guild.iconURL({dynamic: true}))
        .addField("**Server Name: **", `${message.guild.name}`)//طبعا انا حطيتهم داخل `` عشان مايجيني ايرور يقولي لازم تحط .toString() لانه فيه مرات حتى لو حطيتها يجيك ايرور
        .addField("**Server Id: **", `${message.guildId}`)
        .addField("**Server Create Time: **", `<t:${("" + message.guild.createdTimestamp).slice(0, 10)}> || <t:${("" + message.guild.createdTimestamp).slice(0, 10)}:R>`)
        .addField("**Server Icon URL: **", `[${k}](${message.guild.iconURL()})`)
        .addField("**Roles Count: **", `${message.guild.roles.cache.size}`)
        .addField("**Text Channels Count: **", `${message.guild.channels.cache.filter(c => c.type === "GUILD_TEXT").size}`)
        .addField("**Voice Channels Count: **", `${message.guild.channels.cache.filter(c => c.type === "GUILD_VOICE").size}`)
        .addField("**Categorys Count: **", `${message.guild.channels.cache.filter(c => c.type === "GUILD_CATEGORY").size}`)
        .addField("**Server Boosts: **", `${message.guild.premiumSubscriptionCount}`)
        .addField("**Server Boosts Level: **", `${message.guild.premiumTier}`)
        .addField("**Verification Level: **", `${message.guild.verificationLevel}`)//اتوقع كذا خلصنا يلا نجرب الكود
        message.channel.send({embeds: [embed]})
    }
})

client.login("");
