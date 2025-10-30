import { pool } from "../database/database.js";
import * as userModel from "../model/userDB.js";
import * as addressModel from "../model/addressDB.js";


export const createUserWithAddress = async (req, res) => {
    let SQLClient; 
    
    try {
        
        const { username, email, password, street, number, postalCode, city } = req.body;

        if (!username || !email || !password || !street || !number || !postalCode || !city) {
            return res.status(400).send("Champs utilisateur/adresse obligatoires manquants."); 
        }

        
        if (isNaN(number) || parseInt(number) <= 0) { 
            return res.status(400).send("Le numéro de rue (number) doit être un entier positif."); 
        }

        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN"); // Démarre la transaction
        
        // 3. Création de l'utilisateur et récupération de son ID
        const { id: clientID } = await userModel.createUser(SQLClient, req.body);
        
        // 4. Création de l'adresse en utilisant le clientID
        const address = await addressModel.createAddress(SQLClient, req.body, clientID);

        await SQLClient.query("COMMIT"); // Termine la transaction et sauvegarde les deux opérations
        // --- Fin de la transaction ---

        return res.status(201).send({
            message: "Utilisateur et adresse créés avec succès",
            userID: clientID, 
            addressDetails: address
        });

    } catch (err) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur:", err);
        
        // Annulation de la transaction en cas d'erreur (assure l'atomicité)
        if (SQLClient) { 
            try {
                await SQLClient.query("ROLLBACK");
            } catch (errRollback) {
                console.error("Erreur lors du ROLLBACK:", errRollback);
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

        return res.status(200).json(userDetails);

    } catch (err) {
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

