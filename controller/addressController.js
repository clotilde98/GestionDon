import { pool } from '../database/database.js';
import * as addressModel from '../model/addressDB.js';


export const getAddressByUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(user_id)) {
      return res.status(400).json({ message: 'user_id invalide' });
    }

    const addresses = await addressModel.getAddressByUser(pool, id);
    res.json(addresses);
  } catch (err) {
    console.error('getAddressesByUser error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la lecture des adresses' });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const idAdresse = parseInt(req.params.id, 10);
    if (Number.isNaN(idAdresse)) {
      return res.status(400).json({ message: 'id invalide' });
    }

    const updated = await addressModel.updateAddress(pool, idAdresse, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Adresse non trouvée' });
    }

    res.json(updated);
  } catch (err) {
    console.error('updateAddress error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'adresse' });
  }
};


export const deleteAddress = async (req, res) => {
  try {
    const idAdresse = parseInt(req.params.id, 10);
    if (Number.isNaN(idAdresse)) {
      return res.status(400).json({ message: 'id invalide' });
    }

    const deleted = await addressModel.deleteAddress(pool, idAdresse);
    if (!deleted) {
      return res.status(404).json({ message: 'Adresse non trouvée' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('deleteAddress error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'adresse' });
  }
};
