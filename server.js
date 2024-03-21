const express = require('express');
const app = express();
require("dotenv").config();

// node.js에서 폴더 등록
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

//request값 받아오기
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const { MongoClient, ObjectId } = require('mongodb')


let time = new Date();

let db;
const url = process.env.DB_URL;



//mongoDB 접속 명령어
new MongoClient(url).connect().then((client)=>{
    console.log('Database Connected');

    //form 이라는 데이터베이스에 접속
    db = client.db('form');

    
    const PORT = 8080;
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    })

}).catch((err)=>{
    console.log(err)
})

app.get('/', (request, respond) => {
    respond.render('index.ejs', {time : time});
     // localhost:8080/에 들어오면 index.ejs로 랜더링
})

app.get('/about', (request, respond) => {
    respond.sendFile(__dirname + '/about.html');// localhost:8080/about/에 들어오면 about.html 파일 표시
})

app.get('/send', (request, respond) => {
    db.collection('post').insertOne({title : '파천링재'});
    respond.send('대충 데이터 보냄 ㅅㄱ');
})

app.get('/list', async (request, respond) => {
    // post 라는 곳에 접속해서 모든 document를 array 형태로 가져오기
    // await은 다 가져올때까지 기다리라는 말
    var list = [];
    let result = await db.collection('post').find().toArray()
    for(var i=0; i<result.length; i++){
        list.push(`${result[i].title} / ${result[i].content}`);
    }

    //views 폴더내에 있는 list.ejs 파일 전송
    respond.render('list.ejs', {posts : result, time : time});
})

app.get('/write', async (request, respond) => {
    respond.render('write.ejs', {time : time});
}) 


app.post('/insertWrite', async (request, respond) => {
    console.log(request.body);
    if(request.body.title != "" && request.body.content != ""){
        try{
            await db.collection('post').insertOne({title : request.body.title, content:request.body.content});
        }catch(e){
            respond.status(500).send(e);
        }
        respond.redirect("/list");
    }else{
        respond.redirect("/write");
    }
}) 

app.get('/detail/:value', async (request, respond) => {
    //지정된 데이터만 가져옴
    try{
        // object 형식으로 보낸 후 맞는 값을 가져옴
        // new ObjectID 넣어야하라 때 (ObjectId)를 DB에 넣어야함
        // result.params안에 id값 넣음
        let result = await db.collection('post').findOne({_id : new ObjectId(request.params.value)});
        if(!result){
            respond.status(400).send("잘못된 URL!");
        }else{
            respond.render('detail.ejs', {time : time, result: result});
        }

    }catch(e){
        respond.status(400).send("잘못된 URL!");
    }
})  

app.get('/update/:value', async (request, respond) => {
    try{
        let result = await db.collection('post').findOne({_id : new ObjectId(request.params.value)});
        if(!result){
            respond.status(400).send("잘못된 URL!");
        }else{
            respond.render('update.ejs', {time : time, result: result});
        }
    } catch(e){
        respond.status(400).send("잘못된 URL!");
    }
}) 


app.post('/updateWrite', async (request, respond) => {
    console.log(request.body);
    if(request.body.title != "" && request.body.content != ""){
        try{
            // 수정 코드
            // ${수정할 대상}, ${$set : {수정할 값}}
            await db.collection('post').updateOne({_id: new ObjectId(request.body.id)}, {$set : {title : request.body.title, content:request.body.content}});
        }catch(e){
            respond.status(500).send(e);
        }
        respond.redirect("/list");
    }else{
        respond.redirect("/write");
    }
}) 

app.post('/delete', async (request, respond) => {
    console.log(request.body, request.query);
    if(request.body.title != "" && request.body.content != ""){
        try{
            await db.collection('post').deleteOne({_id: new ObjectId(request.body.id)});
        }catch(e){
            respond.status(500).send(e);
        }
        respond.redirect("/list");
    }else{
        respond.redirect("/write");
    }
}) 

app.get('/shop', (request, respond) => {
    respond.send('쇼핑몰');
}) 
