import {pool} from "../database/database.js";
import * as typeProductModel from "../model/productType.js";

export const readAllTypesProduct = async (req, res) => {
    try {
        const typesProduct = await typeProductModel.readAllTypesProduct(pool);
        if(typesProduct && typesProduct.length > 0){
            res.status(200).send(typesProduct);
        }else{
            res.status(404).send("No product type found");
        }
        

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }

}

export const createTypeProduct = async (req, res) => {
    try {
        const productCreated=await typeProductModel.createTypeProduct(pool, req.body);
        if(productCreated){
            res.status(201).send(productCreated);
        }else{
            res.status(404).send("No product type found"); 
        }
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

export const updateTypeProduct = async (req, res) => {
    try {
        await typeProductModel.updateTypeProduct(pool, req.body);
        res.sendStatus(204);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}


export const deleteTypeProduct = async (req, res) => {
    try{
        await typeProductModel.deleteTypeProduct(pool, req.body);
        res.sendStatus(204);

    }catch{
        console.log(err);
        res.sendStatus(500);
    }
}

