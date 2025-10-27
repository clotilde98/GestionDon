import { pool } from "../database/database.js";
import * as userModel from "../model/userDB.js";
import * as addressModel from "../model/addressDB.js";

// Créer un utilisateur + plusieurs adresses
export const createUserWithAddresses = async (req, res) => {
  let SQLClient;
  try {
    const { user, addresses } = req.body;

    if (!user || !user.email || !user.username || !user.password) {
      return res.status(400).json({ error: "Données utilisateur incomplètes" });
    }

   if (addresses && Array.isArray(addresses)) {
            for (const addr of addresses) {
                // Contrôle Numéro de Rue
                if (addr.number !== undefined && addr.number !== null && addr.number < 0) {
                    return res.status(400).json({
                        error: "Le numéro de rue doit être un nombre positif ou nul."
                    });
                }
                
                // Contrôle Code Postal
                if (addr.postal_code !== undefined && addr.postal_code !== null && addr.postal_code < 0) {
                    return res.status(400).json({
                        error: "Le code postal doit être un nombre positif ou nul."
                    });
                }
            }
        }

    SQLClient = await pool.connect();
    await SQLClient.query("BEGIN");

    // Création de l'utilisateur
    const newUser = await userModel.createUser(SQLClient, user);

    // Création des adresses si présentes
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        await addressModel.createAddress(SQLClient, addr, newUser.id);
      }
    }

    await SQLClient.query("COMMIT");
    res.status(201).json({ message: "Utilisateur et adresses créés avec succès", user: newUser });

  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err.message);
    if (SQLClient) await SQLClient.query("ROLLBACK");
    res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
  } finally {
    if (SQLClient) SQLClient.release();
  }
};

// Lire un utilisateur + sa première adresse
export const getUserWithAddress = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const userWithAddress = await userModel.getUserWithAddress(pool, id);
    if (!userWithAddress) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(userWithAddress);
  } catch (err) {
    console.error("Erreur lors de la lecture de l'utilisateur :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour un utilisateur + sa première adresse
export const updateUserWithAddress = async (req, res) => {
  let SQLClient;
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: "ID invalide" });

    SQLClient = await pool.connect();
    await SQLClient.query("BEGIN");

    // Mise à jour de l'utilisateur
    const updatedUser = await userModel.updateUser(SQLClient, { id: userId, ...req.body.user });
    if (!updatedUser) {
      await SQLClient.query("ROLLBACK");
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Mise à jour de la première adresse si présente
    if (req.body.address) {
      const existingAddress = await addressModel.getAddressByUser(SQLClient, userId);
      if (!existingAddress) {
        await SQLClient.query("ROLLBACK");
        return res.status(404).json({ error: "Adresse non trouvée" });
      }

      await addressModel.updateAddress(SQLClient, existingAddress.id, req.body.address);
    }

    await SQLClient.query("COMMIT");
    res.json({ message: "Utilisateur et première adresse mis à jour avec succès", user: updatedUser });

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
    const id = parseInt(req.body.id);
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
    
    if (!searchTerm || searchTerm.length < 2) { 
        // Valide si le terme est présent et suffisamment long
        return res.status(400).json({ error: "Le terme de recherche (q) est requis et doit contenir au moins 2 caractères." });
    }

    try {
        // 2. Appel du Modèle pour exécuter la logique de recherche dans la DB
        const userResults = await findUsersByUsername(pool, searchTerm); 

        // 3. Gestion des résultats
        if (userResults.length === 0) {
            // Aucun résultat trouvé
            return res.status(404).json({ error: "Aucun utilisateur trouvé correspondant au nom : " + searchTerm });
        }
        
        // Succès : retourne la liste des utilisateurs
        res.json({
            count: userResults.length,
            users: userResults
        });

    } catch (err) {
        // 4. Gestion des erreurs serveur (DB, requête mal formée, etc.)
        console.error("Erreur lors de la recherche des utilisateurs :", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la recherche des utilisateurs" });
    }
};


// Assurez-vous d'importer la fonction du Modèle
const { findUsersByUsernamePAGINATED } = require('../models/userModel'); 


export const searchUsersPAGINATED = async (req, res) => {
    
    const pool = req.app.get('pool'); 
    
    
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
        // 2. Appel du Modèle
        const { totalCount, users } = await findUsersByUsernamePAGINATED(pool, searchTerm, limit, offset); 

        // 3. Préparation des Métadonnées de Pagination
        const totalPages = Math.ceil(totalCount / limit);
        
        if (page > totalPages && totalPages > 0) {
             // Redirige ou signale si la page demandée n'existe pas
             return res.status(404).json({ error: `La page ${page} n'existe pas.` });
        }

        // 4. Envoi de la Réponse JSON
        res.status(200).json({
            // Métadonnées de pagination pour le Front-end
            pagination: {
                totalCount: totalCount,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            // Les résultats réels
            users: users
        });

    } catch (err) {
        // 5. Gestion des Erreurs Serveur
        console.error("Erreur Contrôleur (Pagination) :", err.message);
        res.status(500).json({ error: "Erreur serveur lors du traitement de la recherche paginée." });
    }
};

module.exports = {
    searchUsersPAGINATED
};


export const searchUsersWithFilter = async (req, res) => {
    
    
    // 1. Extraction et Validation des Paramètres
    const searchTerm = req.query.q || ''; 
    const adminFilter = req.query.filter || 'all'; // Défaut : 'all'
    
    if (searchTerm.length < 1 && adminFilter === 'all') {
        // Optionnel : ne pas autoriser la recherche si les champs sont vides
        return res.status(400).json({ error: "Veuillez fournir un terme de recherche ou un filtre spécifique." });
    }

    try {
        // 2. Appel du Modèle avec le paramètre de filtre
        const userResults = await findUsersByUsernameAndFilter(
            pool, 
            searchTerm, 
            adminFilter // Le filtre simple
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

module.exports = {
    searchUsersWithFilter
};