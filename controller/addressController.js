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


