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

