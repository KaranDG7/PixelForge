import { Document, model, models, Schema } from "mongoose";
export interface IImage extends Document {
    title: string;
    transformationType: string;
    publicId: string;
    secureUrl: string   ;
    width?: number;
    height?: number;
    config?: object;
    transformationUrl?: URL;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author?: {
        _id: string;
        firstName: string;
        lastName: string;
    }; // Assuming the ObjectId is represented as a string
    createdAt?: Date;
    updatedAt?: Date;
  }
  

const ImageSchema = new Schema({
    title: {type: "string", required: true},
    transformationType: {type: "string", required: true},
    publicId: {type: "string", required: true},
    secureUrl: {type: URL, required: true},
    width: {type: Number},
    height: {type: Number},
    config: {type: Object},
    transformationUrl: { type: URL },
    aspectRatio: { type: String},
    color: {type: String},
    prompt: {type: String},
    author: { type: Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

const Image = models?.Image || model('Image',ImageSchema);

export default Image;