import {Request, response, Response, Router} from 'express';
import {authJwt} from '../middlewares/index';
import Customer from '../models/Customer';
import Denuncia from '../models/Denuncia';
import Restaurant from '../models/Restaurant';
import bcrypt, { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';

class DenunciaRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getAllDenuncias(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allDenuncias = await Denuncia.find().populate("restaurant");

        if (allDenuncias.length == 0) {
            res.status(404).send("There are no denuncias yet.")
        }
        else {
            
            res.status(200).send(allDenuncias);
        }
    }

    public async getDenunciaById(req: Request, res: Response) : Promise<void> {
        const denunciaFound = await Denuncia.findById(req.params._id).populate("restaurant");
        if(denunciaFound == null){
            res.status(404).send("Denuncia not found.");
        }
        else{
            res.status(200).send(denunciaFound);
        }
    }

    public async addDenuncia(req: Request, res: Response) : Promise<void> {
        const denunciaFound = await Denuncia.findOne({description: req.body.description});
        if (denunciaFound != null){
            res.status(409).send("Denuncia already added")
        }

        const {restaurant, description, amount} = req.body;
        const newDenuncia = new Denuncia({restaurant, description, amount});

        await newDenuncia.save();
        res.status(201).send('Denuncia added');
    }

    public async updateDenuncia (req: Request, res: Response) : Promise<void> {
        const denunciaToUpdate = await Denuncia.findByIdAndUpdate (req.params._id, req.body);
        if(denunciaToUpdate == null){
            res.status(404).send("Denuncia not found.");
        }
        else{
            res.status(201).send("Denuncia updated.");
        }
    }

    public async deleteDenuncia(req: Request, res: Response) : Promise<void> {
        const denunciaToDelete = await Denuncia.findByIdAndDelete (req.params._id);
        if (denunciaToDelete == null){
            res.status(404).send("Denuncia not found.")
        }
        else{
            res.status(200).send('Denuncia deleted.');
        }
    } 

routes() {
        this.router.get('/', this.getAllDenuncias);
        this.router.get('/:_id', this.getDenunciaById);
        this.router.post('/', this.addDenuncia);
        this.router.put('/:_id', this.updateDenuncia);
        this.router.delete('/:_id', this.deleteDenuncia);
    }
}
const denunciaRoutes = new DenunciaRoutes();

export default denunciaRoutes.router;