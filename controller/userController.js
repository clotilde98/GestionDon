import { pool } from "../database/database.js";
import * as userModel from "../model/userDB.js";
import * as addressModel from "../model/addressDB.js";

// Créer un utilisateur + plusieurs adresses
export const createUserWithAddresses = async (req, res) => {
  let SQLClient;
  try {
    const { user, addresses } = req.body;

    if (!user || !user.email || !user.NomUser || !user.mot_de_passe) {
      return res.status(400).json({ error: "Données utilisateur incomplètes" });
    }

    SQLClient = await pool.connect();
    await SQLClient.query("BEGIN");

    const newUser = await userModel.createUser(SQLClient, user);

    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        await addressModel.createAddress(SQLClient, addr, newUser.id_user);
      }
    }

    await SQLClient.query("COMMIT");
    res.status(201).json({ message: "Utilisateur et adresses créés", user: newUser });

  } catch (err) {
    console.error("Erreur création utilisateur:", err.message);
    if (SQLClient) await SQLClient.query("ROLLBACK");
    res.status(500).json({ error: err.message });
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
    console.error("Erreur lecture utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour un utilisateur + sa première adresse
export const updateUserWithAddress = async (req, res) => {
  let SQLClient;
  try {
    const id_user = parseInt(req.params.id);
    if (isNaN(id_user)) return res.status(400).json({ error: "ID invalide" });

    SQLClient = await pool.connect();
    await SQLClient.query("BEGIN");

    // Mettre à jour l'utilisateur
    const updatedUser = await userModel.updateUser(SQLClient, { id_user, ...req.body.user });
    if (!updatedUser) {
      await SQLClient.query("ROLLBACK");
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Mettre à jour la première adresse si présente
    if (req.body.address) {
      // Récupérer la première adresse de l'utilisateur
      const existingAddress = await addressModel.getAddressByUser(SQLClient, id_user);
      if (!existingAddress) {
        await SQLClient.query("ROLLBACK");
        return res.status(404).json({ error: "Adresse non trouvée" });
      }

      // Mettre à jour cette adresse
      await addressModel.updateAddress(SQLClient, existingAddress.idAdresse, req.body.address);
    }

    await SQLClient.query("COMMIT");
    res.json({ message: "Utilisateur et première adresse mis à jour", user: updatedUser });

  } catch (err) {
    console.error("Erreur mise à jour utilisateur:", err);
    if (SQLClient) await SQLClient.query("ROLLBACK");
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
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

    res.json({ message: "Utilisateur et ses adresses supprimés" });
  } catch (err) {
    console.error("Erreur suppression utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
