module.exports.codeblock = function(type, content = ""){
    if(!content.length) return "```" + type + "\n```"
    return "```" + type + "\n" + content.join('\n').replace(/\`/g, '`​') + "\n```"  
}