const express = require("express");
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

const app = express()
const Op = Sequelize.Op
const port = 3000

app.use(bodyParser.json())


const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage:'./database.sqlite'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  // Model 

  const Note = sequelize.define('notes',{note:Sequelize.TEXT,tag: Sequelize.STRING})


  // Create table

  sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`);

    Note.bulkCreate([
      { note: 'pick up some bread after work', tag: 'shopping' },
      { note: 'remember to write up meeting notes', tag: 'work' },
      { note: 'learn how to use node orm', tag: 'work' }
    ]).then(function() {
      return Note.findAll();
    }).then(function(notes) {
      console.log(notes);
    });
  });


// Home Page
app.get('/',(req,res) => {
    res.send('Notes App')
})


//get all notes

app.get('/notes', function(req, res) {
  Note.findAll().then(notes => res.json(notes));
});

// app.get('/notes/search', function(req, res) {
//   Note.findAll({ where: { note: req.query.note, tag: req.query.tag } }).then(notes => res.json(notes));
// });


//search notes with query and limit to two

app.get('/notes/search',function(req,res) {
  Note.findAll({
    limit:2,
    where: {
      tag: {
        [Op.or] : [].concat(req.query.tag)
      }
     }
  }).then(notes => res.json(notes))
})



// get single note

app.get('/notes/:id', function(req, res) {
  Note.findAll({ where: { id: req.params.id } }).then(notes => res.json(notes));
});



// create notes

app.post('/notes',function(req,res){
  Note.create({
    note:req.body.note,tag:req.body.tag
  }).then((note)=>res.json(note))
})


// update notes

app.put('/notes/:id',function(req,res){
  Note.findByPk(req.params.id).then(function(note){
    note.update({
      note: req.body.note,
      tag: req.body.tag
    }).then((note)=>{
      res.json(note)
    })
  })
})


//Delete notes

app.delete('/notes/:id',(req,res) => {
  Note.findByPk(req.params.id).then((note) => {
    note.destroy()
  }).then((note) => res.status(200).send('Hurrah!'))
})


app.listen(port,() => console.log(`Notes-App is listening to the port ${port} !`))