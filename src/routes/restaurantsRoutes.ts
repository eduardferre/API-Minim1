import {Request, response, Response, Router} from 'express';

import Restaurant from '../models/Restaurant';
import Reservation from '../models/Reservation';
import Owner from '../models/Owner';

class RestaurantsRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getAllRestaurants(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allRestaurants = await Restaurant.find();
        if (allRestaurants.length == 0){
            res.status(404).send("There are no restaurants yet.")
        }
        else{
            res.status(200).send(allRestaurants);
        }
    }
    public async getRestaurantByName(req: Request, res: Response) : Promise<void> {
        const restaurantFound = await Restaurant.findOne({restaurantName: req.params.restaurantName});
        if(restaurantFound == null){
            res.status(404).send("Restaurant not found.");
        }
        else{
            res.status(200).send(restaurantFound);
        }
    }

    public async getRestaurantById(req: Request, res: Response) : Promise<void> {
        const restaurantFound = await Restaurant.findById(req.params._id).populate('owner');
        if(restaurantFound == null){
            res.status(404).send("Restaurant not found.");
        }
        else{
            res.status(200).send(restaurantFound);
        }
    }
    
    public async addRestaurant(req: Request, res: Response) : Promise<void> {
        const restaurantFound = await Restaurant.findOne({restaurantName: req.body.restaurantName})
        if (restaurantFound != null){
            res.status(409).send("This restaurant already exists.");
            return;
        }
        const ownerFound = await Owner.findById({_id: req.body.owner});
        if (ownerFound == null){
            res.status(404).send("Onwer not found.");
            return;
        }
        const {owner, restaurantName, email, address, description, listTags} = req.body;
        const newRestaurant = new Restaurant({owner, restaurantName, email, address, description, listTags});
        let newRestaurantID;
        await newRestaurant.save().then(restaurant => {
            newRestaurantID = restaurant._id.toString();
        });
        await Owner.findByIdAndUpdate({_id: req.body.owner}, {$push: {listRestaurants: newRestaurantID}})
        res.status(201).send('Restaurant added and owner updated.');
    
    }

    public async updateRestaurant(req: Request, res: Response) : Promise<void> {
        const customerToUpdate = await Restaurant.findByIdAndUpdate (req.params._id, req.body);
        if(customerToUpdate == null){
            res.status(404).send("Restaurant not found.");
        }
        else{
            res.status(201).send('Restaurant updated.');
        }
    }

    public async deleteRestaurant(req: Request, res: Response) : Promise<void> {
        const restaurantToDelete = await Restaurant.findByIdAndDelete (req.params._id);
        if (restaurantToDelete == null){
            res.status(404).send("Restaurant not found.")
        }
        else{
            res.status(200).send('Restaurant deleted.');
        }
    } 
    
    public async filterRestaurants (req:Request, res: Response) : Promise<void> {
        const listTastesCustomer = req.body.tags;
        if (listTastesCustomer.length == 0) {
            res.status(409).send("No tags specidfied in the petition.");
        }
        else {
            const tagsList = listTastesCustomer.map(taste => taste.tagName);
            const allRestaurants = await (Restaurant.find());
            const filteredResutaurants = allRestaurants.filter((restaurant) => {
                let tagsMatches = 0;
                for (let i = 0; i < tagsList.length; i++) {
                    const tagsRestaurant = restaurant.listTags.map((tag) => tag.tagName);
                    console.log(tagsList[i]);
                    console.log(tagsRestaurant);
                    if (tagsRestaurant.includes(tagsList[i])) {
                        tagsMatches++;
                        if (tagsMatches == tagsList.length){
                            return restaurant;
                        }
                    }
                }
            });
            if (filteredResutaurants.length == 0) {
                res.status(404).send("Any restaurant fulfills the requirements.");
            }
            else {
                res.status(200).send(filteredResutaurants);
            }
        }
    }    

    public async sortByRating (req: Request, res: Response) : Promise<void> {
        const allRestaurants = await Restaurant.find();
        if (allRestaurants == null){
            res.status(404).send("There are no restaurants yet.")
        }
        else{
            const sortedRestaurants = allRestaurants.sort((n1, n2) => {
                if (n1.rating > n2.rating) {
                    return -1
                }
                if (n1.rating < n2.rating){
                    return 1
                }
                return 0;
            });
            res.status(200).send(sortedRestaurants);
        }
    }
    
    
    routes() {
        this.router.get('/', this.getAllRestaurants);
        this.router.get('/:_id', this.getRestaurantById);
        this.router.get('/name/:restaurantName', this.getRestaurantByName);
        this.router.get('/filters/tags', this.filterRestaurants);
        this.router.get('/filters/rating', this.sortByRating)
        this.router.post('/', this.addRestaurant);
        this.router.put('/:_id', this.updateRestaurant);
        this.router.delete('/:_id', this.deleteRestaurant);
        
    }
}
const restaurantsRoutes = new RestaurantsRoutes();

export default restaurantsRoutes.router;

