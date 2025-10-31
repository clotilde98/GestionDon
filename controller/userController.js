import { pool } from "../database/database.js";
import * as userModel from "../model/userDB.js";
import * as addressModel from "../model/addressDB.js";

export const createUser = async (req, res) => {
  try {
    const newClient = await userModel.createUser(pool, req.body);
    res.status(201).send("client created " + newClient.id);
  } catch (err){
    res.send(err.message)
  }
}


// Créer un utilisateur + plusieurs adresses
export const createUserWithAddress = async (req, res) => {
  let SQLClient;
  
    
    try {
        const { client, address } = req.body;
        const { username, email, password,photo,isAdmin } = client;
        const { street, number, postalCode, city } = address;

        if (!username || !email || !password || !street || !number || !postalCode || !city) {
            return res.status(400).send("Champs utilisateur/adresse obligatoires manquants."); 
        }

        if (isNaN(number) || parseInt(number) <= 0) { 
            return res.status(400).send("Le numéro de rue (number) doit être un entier positif."); 
        }

        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN");  
        
        const { id: clientID } = await userModel.createUser(SQLClient, client);
        await addressModel.createAddress(SQLClient, address , clientID);

        await SQLClient.query("COMMIT"); 

        return res.status(201).send({
            message: "Utilisateur et adresse créés avec succès",
            
        });

    } catch (err) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur:", err); 
        
        if (SQLClient) { 
            try {
                await SQLClient.query("ROLLBACK");
            } catch (err) { 
                console.error(err);
            }
        }
        
        return res.status(500).send("Erreur interne du serveur. L'opération a été annulée.");
        
    } finally {
        if (SQLClient) {
            SQLClient.release();
        }
    }
};


export const getUserWithAddress = async (req, res) => {
    try {
        const clientID = req.params.id; 
        
        const user = await userModel.getUserById(pool, clientID); 
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
        
        const address = await addressModel.getAddressByUser(pool, clientID); 
        
        const userDetails = {
            ...user, 
            address: address || null 
        };

    const userWithAddress = await userModel.getUserWithAddress(pool, id);
    
    if (!userWithAddress) return res.status(404).json({ error: "Utilisateur non trouvé" });

    } catch (err) {
    }
};

export const updateUserWithAddress = async (req, res) => {
    let SQLClient; 
    
    try {
        
        const clientID = req.params.id; 
        const { client, address } = req.body;

        if (!client && !address) {
            return res.status(400).send("Veuillez fournir des données d'utilisateur ou d'adresse à mettre à jour.");
        }

        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN"); 
        
        let userUpdated = null;
        let addressUpdated = null;

        if (client) {
          
            userUpdated = await userModel.updateUser(SQLClient, clientID, client); 
        }
        
        if (address) {
            
            addressUpdated = await addressModel.updateAddress(SQLClient, clientID, address); 
        }

        if ((client && !userUpdated) || (address && !addressUpdated)) {
             await SQLClient.query("ROLLBACK"); 
             return res.status(404).send("Utilisateur ou adresse non trouvée pour l'ID : " + clientID);
        }

        await SQLClient.query("COMMIT"); 


        return res.status(200).send({
            message: "Utilisateur et adresse mis à jour avec succès",
            userID: clientID,
            updatedUser: userUpdated || client, 
            updatedAddress: addressUpdated || address 
        });

    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", err); 
        
        if (SQLClient) { 
            try {
                await SQLClient.query("ROLLBACK");
            } catch (err) {
                console.error(err);
            }
        }
        
        return res.status(500).send("Erreur interne du serveur. La mise à jour a été annulée.");
        
    } finally {
        if (SQLClient) {
            SQLClient.release(); 
        }
    }
};

// Supprimer un utilisateur + toutes ses adresses
export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const success = await userModel.deleteUser(pool, id);
    if (!success) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({ message: "Utilisateur et toutes ses adresses supprimés avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

