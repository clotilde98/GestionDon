import { pool } from "../database/database.js";
import * as userModel from "../model/userDB.js";
import * as addressModel from "../model/addressDB.js";


export const createUserWithAddress = async (req, res) => {
    let SQLClient; 
    
    try {
        // CORRECTION MAJEURE : Décomposition des champs obligatoires et des champs optionnels.
        const { 
            username, email, password,photo, is_Admin: isAdmin,street, number,  postal_Code: postalCode,city,
        } = req.body;

    

        // 2. Validation spécifique du numéro de rue
        if (isNaN(number) || parseInt(number) <= 0) { 
            return res.status(400).send("Le numéro de rue (number) doit être un entier positif."); 
        }

        // --- Début de la transaction ---
        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN"); // Démarre la transaction
        
        // 3. Création du client : 'photo' et 'isAdmin' sont maintenant définis
        const { id: clientID } = await userModel.createUser(SQLClient, { 
            username, email, password, photo, isAdmin 
        });
        
        // 4. Création de l'adresse
        const address = await addressModel.createAddress(SQLClient, {
            street, number, postalCode, city 
        }, clientID);

        await SQLClient.query("COMMIT"); // Termine la transaction
        // --- Fin de la transaction ---

        return res.status(201).send({
            message: "Utilisateur et adresse créés avec succès",
            userID: clientID, 
            addressDetails: address
        });

    } catch (err) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur:", err); 
        
        // Annulation de la transaction en cas d'erreur
        if (SQLClient) { 
            try {
                await SQLClient.query("ROLLBACK");
            } catch (errRollback) {
                console.error("Erreur lors du ROLLBACK:", errRollback);
            }
        }
        
        // Affiche l'erreur interne, car c'est une erreur SQL ou de serveur.
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

