import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user : Object,
    rating :{
        type: Number,
        default: 0
    },
    comments:String
    })

const linkSchema = new mongoose.Schema({
    title : String,
    url : String
})

const commentSchema = new mongoose.Schema({
    user : Object,
    comments : String,
    commentReplies :[Object]
})

const courseDataSchema = new mongoose.Schema({
    videoUrl : String,
    title : String,
    description : String,
    videoLength : Number,
    videoPlayer: String,
    links:[linkSchema],
    suggestion : String,
    questions : [commentSchema]
})

const courseSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    estimatedPrice:{
        type: Number,
    },
    thumbnail :{
        public_id : {
            type: String,

        },
        url : {
            type: String,
        }
    },
    tags:{
        type:String,
        required:true
    },
    levels:{
        type:String,
        required:true
    },
    demoUrl:{
        type:String,
        required:true
    },
    benefits:[{title:String}],
    prerequisites:[{title:String}],
    reviews:[reviewSchema],
    courseData:[courseDataSchema],
    ratings:{
        type: Number,
        default: 0
    },
    purchased:{
        type : Number,
        default : 0
    }
})

const Course = mongoose.model("Course", courseSchema);
export default Course;