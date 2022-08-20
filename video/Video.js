const{Schema, model} = require("mongoose")
const schema=new Schema({
    videoId:{
          type:String
    },
        data:{
              type:Object  
        }
      
})
module.exports=model('Video',schema)