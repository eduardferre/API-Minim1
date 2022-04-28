import mongoose from 'mongoose';
import {Schema, model} from 'mongoose';

const DenunciaShema = new Schema({
    restaurant: {type:mongoose.Schema.Types.ObjectId, ref:"Restaurant", required: true},
    description: {type: String, required:true},
    amount: {type: Number, required: true},
    denunciaDate: {type: Date, default:Date.now},
})

export default model('Denuncia', DenunciaShema);