const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/blog'

const connectDB = async () => {
    try {

        await mongoose.connect(uri,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MONGODB connected');
    }catch (err){
        console.error(`connection problem ${err}`);
    }
}

module.exports = connectDB;