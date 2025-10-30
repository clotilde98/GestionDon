import { pool } from "../database/database.js";
import * as userModel from "../model/userDB.js";
import * as addressModel from "../model/addressDB.js";

export const createUserWithAddress = async (req, res) => {
    let SQLClient;
    
    try {
        
        const { username, email, password, street, number,  postalCode ,city } = req.body;

        
        if (!username || !email || !password || !street || !number || !postalCode || !city) {
            return res.status(404).send("Champs utilisateur/adresse obligatoires manquants.");
        }
         if (number < 0) {
                return res.status(404).send("Le numéro de rue (number) doit être un entier positif.");
            
        }

      
        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN"); 
        
        const { id: clientID } = await userModel.createUser(SQLClient, req.body);
        
        const address = await addressModel.createAddress(SQLClient, req.body, clientID);

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
        
        return res.status(500).send("Erreur interne du serveur. L'opération a été annulée." );
        
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


export const updateUserWithAddress = async (req, res) => {
    let SQLClient;
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) return res.status(400).json({ error: "ID invalide" });

        const userData = req.body.user;
        const addressData = req.body.address;

        // Validation : Au moins un champ de user ou address doit être fourni pour la mise à jour
        if (!userData && !addressData) {
            return res.status(400).json({ error: "Aucune donnée de mise à jour fournie pour l'utilisateur ou l'adresse." });
        }

        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN");

        let updatedUser = null;

        // 1. Mise à jour de l'utilisateur (dynamique)
        if (userData && Object.keys(userData).length > 0) {
            updatedUser = await userModel.updateUser(SQLClient, { id: userId, ...userData });
            if (!updatedUser) {
                await SQLClient.query("ROLLBACK");
                return res.status(404).json({ error: "Utilisateur non trouvé ou mise à jour utilisateur échouée." });
            }
        } else {
            // Si l'utilisateur n'a pas été mis à jour, on le récupère quand même pour la réponse finale
            // si l'adresse a été modifiée
            updatedUser = await userModel.getUserById(SQLClient, userId);
            if (!updatedUser) {
                 await SQLClient.query("ROLLBACK");
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
        }


        // 2. Mise à jour de la première adresse si des données sont présentes
        let updatedAddress = null;
        if (addressData && Object.keys(addressData).length > 0) {
            
            const existingAddress = await addressModel.getAddressByUser(SQLClient, userId);
            
            if (!existingAddress) {
                // Ici, on pourrait soit faire ROLLBACK, soit créer l'adresse si la sémantique le permet.
                // Pour l'instant, nous faisons un ROLLBACK si on demande une mise à jour d'une adresse inexistante.
                await SQLClient.query("ROLLBACK");
                return res.status(404).json({ error: "Adresse non trouvée pour l'utilisateur." });
            }

            updatedAddress = await addressModel.updateAddress(SQLClient, existingAddress.id, addressData);
            
            if (!updatedAddress) {
                 await SQLClient.query("ROLLBACK");
                 return res.status(500).json({ error: "Mise à jour de l'adresse échouée." });
            }

        } else {
            // Récupérer l'adresse existante si on n'a pas mis à jour l'utilisateur (pour la réponse complète)
            updatedAddress = await addressModel.getAddressByUser(SQLClient, userId);
        }

        await SQLClient.query("COMMIT");
        
        // Construction de la réponse finale
        const finalDetails = {
            ...updatedUser,
            address: updatedAddress || null
        };

        res.json({ message: "Utilisateur et/ou adresse mis(e) à jour avec succès", details: finalDetails });

    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", err.message);
        if (SQLClient) await SQLClient.query("ROLLBACK");
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    } finally {
        if (SQLClient) SQLClient.release();
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


export const searchUsersByUsername = async (req, res) => {
    
    const searchTerm = req.query.q; // Extraction du terme de recherche
    
    if (!searchTerm || searchTerm.length < 2) { 
        return res.status(400).json({ error: "Le terme de recherche (q) est requis et doit contenir au moins 2 caractères." });
    }

    try {
        const userResults = await findUsersByUsername(pool, searchTerm); 

        if (userResults.length === 0) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé correspondant au nom : " + searchTerm });
        }
        
        res.json({
            count: userResults.length,
            users: userResults
        });

    } catch (err) {
        console.error("Erreur lors de la recherche des utilisateurs :", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la recherche des utilisateurs" });
    }
};

export const searchUsersPAGINATED = async (req, res) => {
    
    // Si 'pool' n'est pas importé ou accessible globalement, utilisez l'importation 'pool'
    // sinon, si vous l'injectez, utilisez req.app.get('pool') comme vous l'aviez fait.
    const dbClient = pool; // Utiliser l'importation 'pool'

    // Valeurs par défaut : 'q' est vide, page=1, limit=10
    const searchTerm = req.query.q || ''; 
    const page = parseInt(req.query.page, 10) || 1; 
    const limit = parseInt(req.query.limit, 10) || 10; 
    
    // Validation simple des entrées numériques
    if (isNaN(page) || page < 1) return res.status(400).json({ error: "Le paramètre 'page' est invalide." });
    if (isNaN(limit) || limit < 1) return res.status(400).json({ error: "Le paramètre 'limit' est invalide." });

    // Calcul de l'OFFSET : ce que la DB doit sauter
    const offset = (page - 1) * limit;

    try {
        const { totalCount, users } = await findUsersByUsernamePAGINATED(dbClient, searchTerm, limit, offset); 

        // Préparation des Métadonnées de Pagination
        const totalPages = Math.ceil(totalCount / limit);
        
        if (page > totalPages && totalPages > 0) {
             return res.status(404).json({ error: `La page ${page} n'existe pas.` });
        }

        // Envoi de la Réponse JSON
        res.status(200).json({
            pagination: {
                totalCount: totalCount,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            users: users
        });

    } catch (err) {
        console.error("Erreur Contrôleur (Pagination) :", err.message);
        res.status(500).json({ error: "Erreur serveur lors du traitement de la recherche paginée." });
    }
};

export const searchUsersWithFilter = async (req, res) => {
    
    const dbClient = pool; // Utiliser l'importation 'pool'
    
    // 1. Extraction et Validation des Paramètres
    const searchTerm = req.query.q || ''; 
    const adminFilter = req.query.filter || 'all'; // Défaut : 'all'
    
    if (searchTerm.length < 1 && adminFilter === 'all') {
        return res.status(400).json({ error: "Veuillez fournir un terme de recherche ou un filtre spécifique." });
    }

    try {
        // 2. Appel du Modèle avec le paramètre de filtre
        const userResults = await findUsersByUsernameAndFilter(
            dbClient, // Utiliser l'objet pool importé
            searchTerm, 
            adminFilter 
        ); 

        // 3. Gestion de la Réponse
        if (userResults.length === 0) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé correspondant à ces critères." });
        }

        res.status(200).json({
            count: userResults.length,
            filter: adminFilter,
            users: userResults
        });

    } catch (err) {
        // 4. Gestion des Erreurs Serveur
        console.error("Erreur Contrôleur (Filtre Simple) :", err.message);
        res.status(500).json({ error: "Erreur serveur lors de l'exécution de la recherche avec filtre." });
    }
};