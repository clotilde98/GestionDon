import { pool } from '../database/database.js';
import * as addressModel from '../model/addressDB.js';


export const getAddressByUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    const addresses = await addressModel.getAddressByUser(pool, id);
    res.json(addresses);
  } catch (err) {
    console.error('getAddressByUser error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la lecture des adresses' });
  }
};


