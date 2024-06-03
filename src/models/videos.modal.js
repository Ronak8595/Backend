import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String,
        require: true,
    },
    thumbNail:{
        type: String,
        require: true,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    title:{
        type: String,
        require: true,
    },
    discribtion:{
        type: String,
        require: true,
    },
    duration:{
        type: number,
        require: true,
    },
    views:{
        type: number,
        default: 0,
    },
    isPublished:{
        type: boolean,
        default: true,
    },
},{
    timestamps: true,
})

videoSchema.plugin(aggregatePaginate);

export const Videos = mongoose.model("Video", videoSchema);