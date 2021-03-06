import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Thought = mongoose.model('Thought', { 
  message: {
    type: String,
    required: true, //validation rule
    minlength: 5, //validation rule
    maxlength: 140  //validation rule
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/thoughts', async (req, res) => {
  const thoughts = await Thought.find().sort({createdAt: 'desc'}).limit(20)
  res.json(thoughts);
})

app.post('/thoughts', async (req, res) => {
  //Retrive the information sent by the client to our API endpoint
  const {message} = req.body;
  //Use our mongoose model to create the database entry
  const thought = new Thought({message});


try {
  //If sucessful
  const savedThought = await thought.save();
  res.status(201).json(savedThought);
  //If not sucessful
} catch (err) {
  res.status(400).json({message: 'Could not save thought to the database', error: err.errors});
}

});

app.post('/:thoughtId/like', async (req, res) => {
  try{
    const like = await Thought.findOneAndUpdate(
      { "_id": req.params.thoughtId },
      { $inc: {"hearts": 1} }
    )
    console.log("Likes success")
    res.status(201).json(like)
  }catch (err) {
    res.status(400).json({message: 'Could not save like', error: err.errors})
    console.logg("In Error Likes")
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
