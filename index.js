const express=require("express")
const app=express()
const body=require('body-parser')
const fs=require('fs')
const path=require('path')
var XMLHttpRequest = require('xhr2')
const mongoose=require('mongoose')
var json2xls = require('json2xls');
const Video=require('./video/Video')
const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')
const User=require("./user/User")
const {check, validationResult} = require('express-validator')


let PORT=process.env.PORT || 5000
const filePath2=path.join(__dirname,"localstorage","localstorage.txt")
app.use(express.json({extended:true}))
app.set('view engine','ejs')
app.set("views", path.resolve(__dirname,"ejs"))
app.use(express.static(path.join(__dirname, 'build')));
app.use('/form', body.urlencoded({
    extended: true
}));
app.use('/excel', body.urlencoded({
    extended: true
}));

let allxls=[]




app.post('/changeData',(req,res)=>{
    console.log(req.body)
    const date=new Date()
    
    Video.updateOne({_id:req.body.id}, {data:{
      title:req.body.changeTitle,
     description:req.body.changeDescription,
      tags:req.body.changeTags,
      city:req.body.changeCity,
      country:req.body.changeCountry,
      date:req.body.changeDate,
      videoId:req.body.changeVideoId,
      videoLink:req.body.changeVideoLink,
      downloadPhoto:req.body.changeDownloadPhoto,
      downloadVideo:req.body.changeDownloadVideo,
      lastModif:date.toGMTString(),
      
    }},()=>{
      console.log("Изменено")
    })
    res.json(req.body)
  })





app.post('/excel', function(req, res, next) {
    console.log(req.body)
    const filePathExcel=path.join(__dirname,"excel","data.xlsx")
    // Объект req.body содержит данные из переданной формы
    var json2xls = require('json2xls');
    let objectData={
        Id:req.body.videoId,
        TITLE:req.body.title,
        VideoLink:req.body.videoLink,
        STORY:req.body.description,
        DATE:req.body.date,
        CITY:req.body.city,
        COUNTRY:req.body.country,
        KEYWORDS:req.body.tags
    }
    allxls.push(objectData)
    
var xls = json2xls(allxls);


fs.writeFileSync(filePathExcel, xls, 'binary');
allxls=[]

//     fs.readFile(filePath2,"utf-8",(err,content)=>{
//     if(err){
//         throw err
//     }
//     console.log(content)
//     filePath4=path.join(__dirname,"alldata",'alldata'+".xml" )
//      fs.writeFile(filePath4, content ,async (err)=>{
//         if(err){
//             throw err
//         }
//         else{
//             console.log("XML файл создан")
            
    setTimeout(()=>{
        fs.writeFile(filePath2, ``,(err)=>{ 
            if(err){
                throw err
            }
            else{
                console.log("Удалено")
                
            
            }
    })
    },2000)    
            
        

res.json("Успех")
    
// })
    
})


app.post('/delete', (req,res)=>{
    console.log("Файл удален")
    console.log(req.body)
    Video.findOneAndDelete({_id:req.body.id},()=>{
      console.log("Всё удалилось")
    })
    res.json(req.body)
  })







 app.post(
    '/login',
    [
      check('email', 'Введите корректный email').normalizeEmail().isEmail(),
      check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректный данные при входе в систему'
        })
      }
  
      const {email, password} = req.body
  
      const user = await User.findOne({ email })
  
      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' })
      }
  
      const isMatch = await bcrypt.compare(password, user.password)
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль, попробуйте снова' })
      }
  
      const token = jwt.sign(
        { userId: user.id },
        "admin video application",
        { expiresIn: '1h' }
      )
  
      res.json({ token, userId: user.id })
  
    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
  })




 app.post(
    '/register',
    [
      check('email', 'Некорректный email').isEmail(),
      check('password', 'Минимальная длина пароля 6 символов')
        .isLength({ min: 6 })
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректный данные при регистрации'
        })
      }
  
      const {email, password} = req.body
  
      const candidate = await User.findOne({ email })
  
      if (candidate) {
        return res.status(400).json({ message: 'Такой пользователь уже существует' })
      }
  
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({ email, password: hashedPassword })
  
      await user.save()
  
      res.status(201).json({ message: 'Пользователь создан' })
  
    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
  })
  










































































app.post("/alldata",async(req,res)=>{
    console.log("Подключено к бэкэнду")
    const videos=await Video.find({})
    res.json(videos)
    
    
})





app.post('/data',async(req,res)=>{
    try{
      
  
     
      
        console.log(req.body)
        const {title,description,tags,city,country,category,date,videoLink,videoId,downloadVideo,downloadPhoto,lastModif,brandSafe}=req.body
        
        const hasId = await Video.findOne({videoId})
        
        console.log(hasId)
            if (hasId) {
              return res.status(409).json({ message: 'Видео с таким id уже существует в базе данных' })
            }
        
        if (brandSafe){
          const video = new Video({
            videoId:videoId,
            data:{
                title,description,tags,city,country,category,date,videoId,videoLink,downloadVideo,downloadPhoto,lastModif,
                mRSS2:`<item> <media:title>${title}</media:title> <media:description>${description}</media:description> <media:keywords>${tags}</media:keywords> <media:city>${city}</media:city> <media:country>${country}</media:country> <media:category>${category}</media:category> <media:filmingDate>${date}</media:filmingDate> <guid>${videoId} </guid> <media:youtubeLink>${videoLink}</media:youtubeLink> <pubDate>${date}</pubDate> <media:thumbnail url="${downloadPhoto}" /> <media:content url="${downloadVideo}" /> <dfpvideo:lastModifiedDate>${lastModif}</dfpvideo:lastModifiedDate>  <dfpvideo:lastMediaModifiedDate>${lastModif}</dfpvideo:lastMediaModifiedDate> </item> `
            }
        })
        await video.save()
        }
        else{
          const video = new Video({
            videoId:videoId,
            data:{
                title,description,tags,city,country,category,date,videoId,videoLink,downloadVideo,downloadPhoto,lastModif,
                mRSS:`<item> <media:title>${title}</media:title> <media:description>${description}</media:description> <media:keywords>${tags}</media:keywords> <media:city>${city}</media:city> <media:country>${country}</media:country> <media:category>${category}</media:category> <media:filmingDate>${date}</media:filmingDate> <guid>${videoId} </guid> <media:youtubeLink>${videoLink}</media:youtubeLink> <pubDate>${date}</pubDate> <media:thumbnail url="${downloadPhoto}" /> <media:content url="${downloadVideo}" /> <dfpvideo:lastModifiedDate>${lastModif}</dfpvideo:lastModifiedDate>  <dfpvideo:lastMediaModifiedDate>${lastModif}</dfpvideo:lastMediaModifiedDate> </item> `
            }
        })
        await video.save()
        }
        
        console.log("Данные записаны")
        res.json()
    }catch(e){console.log(e.message)}
 
})






// app.post('/form', function(req, res, next) {
//     // Объект req.body содержит данные из переданной формы
    
//     console.dir(req.body)
    
//     filePath=path.join(__dirname, req.body.paths,req.body.video_id+".xml" )
//     fs.writeFile(filePath, `<?xml version="1.0" encoding="UTF-8"?><item><title>${req.body.title}</title><description>${req.body.description}</description><guid>${req.body.video_id}</guid><category>${req.body.category}</category><pubDate>${new Date()}</pubDate> <media:keywords>${req.body.tags}</media:_media_keywords></item>\n`,(err)=>{
//         if(err){
//             throw err
//         }
//         else{
//             console.log("XML файл создан")
            
//             let objectData={
//                 Id:req.body.video_id,
//                 TITLE:req.body.title,
//                 VideoLink:req.body.video_link,
//                 STORY:req.body.description,
//                 DATE:req.body.date,
//                 CITY:req.body.city,
//                 COUNTRY:req.body.country,
//                 KEYWORDS:req.body.tags
//             }
//             allxls.push(objectData)
//             console.log(allxls)
//             fs.appendFile(filePath2,`<?xml version="1.0" encoding="UTF-8"?><item><title>${req.body.title}</title><description>${req.body.description}</description><guid>${req.body.video_id}</guid><category>${req.body.category}</category><pubDate>${new Date()}</pubDate> <media:keywords>${req.body.tags}</media:_media_keywords></item>\n`,(err)=>{
//     if(err){
//         throw err
//     }
//     console.log('File writed')})
//         }
// })
// })

const start=async()=>{
    try{
        await mongoose.connect('mongodb+srv://admin:k9logpHTmwIWtR17@cluster0.tdvhizy.mongodb.net/?retryWrites=true&w=majority',{})
        app.listen(PORT,()=>{
            console.log("Server has been launched on PORT", PORT)
        })
    }catch(e){console.log(e.message)}
    
}
start()

app.get('/mrss',async(req,res)=>{
    
    
    

      

    res.render('index',{
        array:await Video.find({}),
        start:'<?xml version="1.0" encoding="UTF-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:dfpvideo="http://api.google.com/dfpvideo" xmlns:tms="http://data.tmsapi.com/v1.1" version="2.0"> <channel> <title>ViralBear videos</title> <dfpvideo:version>2</dfpvideo:version>',
        end:'</channel> </rss>'
    })
})
app.get('/mrss2',async(req,res)=>{
    
    
    

      

  res.render('index2',{
      array:await Video.find({}),
      start:'<?xml version="1.0" encoding="UTF-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:dfpvideo="http://api.google.com/dfpvideo" xmlns:tms="http://data.tmsapi.com/v1.1" version="2.0"> <channel> <title>ViralBear videos</title> <dfpvideo:version>2</dfpvideo:version>',
      end:'</channel> </rss>'
  })
})